import * as dotenv from "dotenv";
dotenv.config();

import { Worker, Job } from "bullmq";
import prisma from "../../web/src/lib/prisma";

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT || 6379),
  ...(process.env.REDIS_PASSWORD ? { password: process.env.REDIS_PASSWORD } : {}),
};

const QUEUE_NAME = "resume-processing";

interface ProcessResumePayload {
  resumeId: string;
  userId: string;
  fileUrl: string;
}

const worker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    const attempt  = job.attemptsMade + 1;
    const maxAttempts = (job.opts.attempts ?? 1);

    console.log(`[Worker] Received job: ${job.name} (ID: ${job.id}) — attempt ${attempt}/${maxAttempts}`);

    if (job.name === "PROCESS_RESUME") {
      const data = job.data as ProcessResumePayload;

      try {
        const resume = await prisma.resume.findUnique({
          where: { id: data.resumeId },
        });

        if (!resume) {
          throw new Error(`Resume with ID ${data.resumeId} not found in database.`);
        }

        await prisma.resume.update({
          where: { id: data.resumeId },
          data: { status: "PROCESSING" },
        });

        // TODO: Add AI analysis logic

        await prisma.resume.update({
          where: { id: data.resumeId },
          data: { status: "COMPLETED" },
        });
        console.log(`[Worker] [${job.id}] Resume ${data.resumeId} processed successfully — status: COMPLETED`);
      } catch (error) {
        const willRetry = attempt < maxAttempts;
        console.error(
          `[Worker] [${job.id}] Error on attempt ${attempt}/${maxAttempts}` +
          ` — ${willRetry ? `will retry (backoff: exponential)` : "no retries left"}`
        );
        console.error(`[Worker] [${job.id}] Error detail:`, error);

        if (!willRetry) {
          try {
            await prisma.resume.update({
              where: { id: data.resumeId },
              data: { status: "FAILED" },
            });
            console.log(`[Worker] [${job.id}] Status updated to FAILED`);
          } catch (updateErr) {
            console.error(`[Worker] [${job.id}] Could not update status to FAILED:`, updateErr);
          }
        }

        throw error;
      }
    } else {
      console.log(`[Worker] Unknown job type: ${job.name}. Skipping.`);
    }
  },
  {
    connection,
  }
);

worker.on("failed", (job: Job | undefined, err: Error) => {
  if (job) {
    const attempt    = job.attemptsMade;
    const maxAttempts = job.opts.attempts ?? 1;
    const exhausted  = attempt >= maxAttempts;

    console.error(
      `[Worker] Job ${job.id} (${job.name}) failed` +
      ` — attempt ${attempt}/${maxAttempts}` +
      ` — ${exhausted ? "all retries exhausted" : "will be retried"}`
    );
    console.error(`[Worker] Failure reason: ${err.message}`);
    if (err.stack) {
      console.error(`[Worker] Stack trace:\n${err.stack}`);
    }
  } else {
    console.error(`[Worker] A job failed (no job context available): ${err.message}`);
  }
});

worker.on("error", (err: Error) => {
  console.error(`[Worker] Worker error:`, err.message);
});

console.log(`[Worker] Successfully started and listening to queue "${QUEUE_NAME}"`);

process.on("SIGTERM", async () => {
  console.log("[Worker] Shutting down gracefully...");
  await worker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[Worker] Shutting down gracefully...");
  await worker.close();
  process.exit(0);
});
