import { Queue, JobsOptions } from "bullmq";

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT || 6379),
  ...(process.env.REDIS_PASSWORD ? { password: process.env.REDIS_PASSWORD } : {}),
};

// ---------------------------------------------------------------------------
// Shared default job options — single source of truth for retry behaviour
// ---------------------------------------------------------------------------
export const QUEUE_DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1_000,
  },
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 100 },
};

export const resumeQueue = new Queue<ResumeJobPayload>("resume-processing", {
  connection,
  defaultJobOptions: QUEUE_DEFAULT_JOB_OPTIONS,
});

export async function addJob(
  type: typeof JobType.PROCESS_RESUME,
  payload: ProcessResumePayload,
  options?: JobsOptions,
): Promise<void>;

export async function addJob(
  type: typeof JobType.MATCH_JOB_DESCRIPTION,
  payload: MatchJobDescriptionPayload,
  options?: JobsOptions,
): Promise<void>;

export async function addJob(
  type: JobType,
  payload: ResumeJobPayload,
  options?: JobsOptions,
): Promise<void> {
  await resumeQueue.add(type, payload, {
    jobId: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...options,
  });
}

export enum JobType {
  PROCESS_RESUME = "PROCESS_RESUME",
  MATCH_JOB_DESCRIPTION = "MATCH_JOB_DESCRIPTION",
}

export interface ProcessResumePayload {
  resumeId: string;
  userId: string;
  fileUrl: string;
}

export interface MatchJobDescriptionPayload {
  resumeId: string;
  userId: string;
  jobDescriptionId: string;
}

export type ResumeJobPayload = ProcessResumePayload | MatchJobDescriptionPayload;
