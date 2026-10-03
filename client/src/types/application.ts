import { Job } from './job';
import { Review } from './review';

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface StudentProfileData {
  fullName: string;
  phone?: string | null;
  university?: string | null;
  major?: string | null;
  graduationYear?: number | null;
  bio?: string | null;
  cvUrl?: string | null;
  skills: string[];
}

export interface ApplicantUser {
  id: string;
  email: string;
  studentProfile?: StudentProfileData | null;
}

export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  coverLetter?: string | null;
  cvUrl?: string | null;
  status: ApplicationStatus;
  rejectReason?: string | null;
  appliedAt?: string;
  createdAt: string;
  updatedAt: string;
  job?: Job;
  student?: ApplicantUser;
  reviews?: Review[];
}

export interface JobApplicationsSummary {
  slots: number;
  totalApplications: number;
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
  withdrawnCount: number;
  isFull: boolean;
  jobTitle?: string;
  remainingSlots?: number;
}

export interface JobApplicationsResponse {
  job: {
    id: string;
    title: string;
    slots: number;
    status: string;
    deadline: string;
    category?: {
      id: string;
      name: string;
    };
  };
  summary: JobApplicationsSummary;
  applications: Application[];
}
