import * as dotenv from "dotenv";
dotenv.config();

import { Worker, Job } from "bullmq";
import prisma from "../../web/src/lib/prisma";
import { callProcessResume, AIServiceError } from "./aiServiceClient";

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT || 6379),
  ...(process.env.REDIS_PASSWORD ? { password: process.env.REDIS_PASSWORD } : {}),
  tls: process.env.REDIS_TLS === "true" ? {} : undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

const QUEUE_NAME = "resume-processing";

interface ProcessResumePayload {
  resumeId: string;
  userId: string;
  fileUrl: string;
}

async function markProcessing(resumeId: string, jobId: string): Promise<void> {
  await prisma.resume.update({
    where: { id: resumeId },
    data: { status: "PROCESSING" },
  });
  console.log(`[Worker] [${jobId}] Status → PROCESSING`);
}

async function storeResultAndComplete(
  resumeId: string,
  jobId: string,
  analysis: {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    missingKeywords: string[];
  }
): Promise<void> {
  await prisma.$transaction([
    prisma.resumeAnalysis.create({
      data: {
        resumeId,
        overallScore: analysis.overallScore,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        suggestions: analysis.suggestions,
        missingKeywords: analysis.missingKeywords,
      },
    }),
    prisma.resume.update({
      where: { id: resumeId },
      data: { status: "COMPLETED" },
    }),
  ]);
  console.log(
    `[Worker] [${jobId}] Analysis stored & status → COMPLETED` +
    ` (score: ${analysis.overallScore})`
  );
}

async function markFailed(resumeId: string, jobId: string): Promise<void> {
  try {
    await prisma.resume.update({
      where: { id: resumeId },
      data: { status: "FAILED" },
    });
    console.log(`[Worker] [${jobId}] Status → FAILED`);
  } catch (err) {
    console.error(`[Worker] [${jobId}] Could not update status to FAILED:`, err);
  }
}

async function processResumeJob(job: Job): Promise<void> {
  const data = job.data as ProcessResumePayload;
  const jobId = job.id ?? "unknown";
  const attempt = job.attemptsMade + 1;
  const maxAttempts = job.opts.attempts ?? 1;

  console.log(
    `[Worker] Job ${jobId} received — attempt ${attempt}/${maxAttempts}` +
    ` | resumeId=${data.resumeId}`
  );

  if (!data.resumeId || !data.fileUrl) {
    throw Object.assign(
      new Error("Job payload is missing resumeId or fileUrl."),
      { retryable: false }
    );
  }

  const resume = await prisma.resume.findUnique({
    where: { id: data.resumeId },
  });
  if (!resume) {
    throw Object.assign(
      new Error(`Resume ${data.resumeId} not found in database.`),
      { retryable: false }
    );
  }

  await markProcessing(data.resumeId, jobId);

  console.log(`[Worker] [${jobId}] Calling AI service | fileUrl=${data.fileUrl}`);
  let aiResponse;
  try {
    aiResponse = await callProcessResume(data.fileUrl);
  } catch (err) {
    if (err instanceof AIServiceError && !err.isRetryable) {
      const willRetry = attempt < maxAttempts;
      if (!willRetry) await markFailed(data.resumeId, jobId);
      throw err;
    }
    throw err;
  }

  const { analysis } = aiResponse;
  console.log(
    `[Worker] [${jobId}] AI analysis received` +
    ` | score=${analysis.overall_score}` +
    ` | strengths=${analysis.strengths.length}` +
    ` | suggestions=${analysis.suggestions.length}`
  );

  await storeResultAndComplete(data.resumeId, jobId, {
    overallScore: analysis.overall_score,
    strengths: analysis.strengths,
    weaknesses: analysis.weaknesses,
    suggestions: analysis.suggestions,
    missingKeywords: analysis.missing_keywords,
  });
}

const worker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    const jobId = job.id ?? "unknown";
    const attempt = job.attemptsMade + 1;
    const maxAttempts = job.opts.attempts ?? 1;

    if (job.name !== "PROCESS_RESUME") {
      console.warn(`[Worker] Unknown job type "${job.name}" — skipping.`);
      return;
    }

    try {
      await processResumeJob(job);
    } catch (error: any) {
      const willRetry = attempt < maxAttempts;
      console.error(
        `[Worker] [${jobId}] Failed on attempt ${attempt}/${maxAttempts}` +
        ` — ${willRetry ? "will retry (exponential backoff)" : "no retries left"}`
      );
      console.error(`[Worker] [${jobId}] Error: ${error?.message}`);

      if (!willRetry) {
        const data = job.data as ProcessResumePayload;
        if (data?.resumeId) await markFailed(data.resumeId, jobId);
      }

      throw error; 
    }
  },
  {
    connection,
    concurrency: Number(process.env.WORKER_CONCURRENCY || 2),
    stalledInterval: 60_000,
    lockDuration: 60_000,
  }
);

worker.on("failed", (job: Job | undefined, err: Error) => {
  if (!job) {
    console.error(`[Worker] A job failed with no context: ${err.message}`);
    return;
  }
  const attempt = job.attemptsMade;
  const maxAttempts = job.opts.attempts ?? 1;
  const exhausted = attempt >= maxAttempts;

  console.error(
    `[Worker] Job ${job.id} (${job.name}) failed` +
    ` — ${exhausted ? "all retries exhausted" : `attempt ${attempt}/${maxAttempts} — will retry`}` +
    ` — ${err.message}`
  );
});

worker.on("error", (err: Error) => {
  console.error("[Worker] Worker-level error:", err.message);
});

worker.on("completed", (job: Job) => {
  console.log(`[Worker] Job ${job.id} completed successfully.`);
});

console.log(`[Worker] Listening to queue "${QUEUE_NAME}"...`);

const shutdown = async (signal: string) => {
  console.log(`[Worker] ${signal} received — shutting down gracefully...`);
  await worker.close();
  await prisma.$disconnect();
  console.log("[Worker] Shutdown complete.");
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
