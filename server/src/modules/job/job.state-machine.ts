import { JobStatus } from '@prisma/client';

/**
 * Pure function to validate state transitions for a Job.
 * State Machine:
 * DRAFT -> OPEN, CLOSED
 * OPEN -> FILLED, CLOSED, DRAFT
 * FILLED -> OPEN, COMPLETED, CLOSED
 * COMPLETED -> No further transitions
 * CLOSED -> No further transitions
 */
export const canJobTransition = (from: JobStatus, to: JobStatus): boolean => {
  if (from === to) return true; // Same state is valid (no-op)

  const allowedTransitions: Record<JobStatus, JobStatus[]> = {
    [JobStatus.DRAFT]: [JobStatus.OPEN, JobStatus.CLOSED],
    [JobStatus.OPEN]: [JobStatus.FILLED, JobStatus.CLOSED, JobStatus.DRAFT, JobStatus.COMPLETED],
    [JobStatus.FILLED]: [JobStatus.OPEN, JobStatus.COMPLETED, JobStatus.CLOSED],
    [JobStatus.COMPLETED]: [], // Terminal state
    [JobStatus.CLOSED]: [], // Terminal state
  };

  return allowedTransitions[from]?.includes(to) || false;
};
