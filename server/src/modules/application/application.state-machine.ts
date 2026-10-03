import { ApplicationStatus } from '@prisma/client';

/**
 * Pure state machine validation function for Application transitions.
 * Transitions supported:
 * - PENDING -> ACCEPTED
 * - PENDING -> REJECTED
 * - PENDING -> WITHDRAWN (Student withdraws pending application)
 * - ACCEPTED -> WITHDRAWN (Student withdraws accepted application before job completion)
 * - ACCEPTED -> REJECTED (Employer cancels previously accepted candidate)
 */
export const canApplicationTransition = (
  from: ApplicationStatus,
  to: ApplicationStatus
): boolean => {
  if (from === to) return true;

  const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
    PENDING: [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN],
    ACCEPTED: [ApplicationStatus.WITHDRAWN, ApplicationStatus.REJECTED],
    REJECTED: [],
    WITHDRAWN: [],
  };

  return validTransitions[from]?.includes(to) ?? false;
};
