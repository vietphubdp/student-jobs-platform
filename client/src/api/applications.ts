import { apiClient } from './client';
import {
  Application,
  JobApplicationsResponse,
} from '../types/application';
import { PaginationMeta } from '../types/job';

export interface ApplyJobPayload {
  coverLetter?: string;
}

export interface UpdateAppStatusPayload {
  status: 'ACCEPTED' | 'REJECTED';
  reason?: string;
}

export const applicationApi = {
  // Student apply for a job
  applyJob: async (jobId: string, data: ApplyJobPayload): Promise<Application> => {
    const res = await apiClient.post(`/jobs/${jobId}/applications`, data);
    return res.data.data;
  },

  // Student get their own applications
  getStudentApplications: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ applications: Application[]; pagination: PaginationMeta }> => {
    const res = await apiClient.get('/student/applications', { params });
    return {
      applications: res.data.data,
      pagination: res.data.meta?.pagination,
    };
  },

  // Student withdraw application
  withdrawApplication: async (
    applicationId: string,
    reason?: string
  ): Promise<Application> => {
    const res = await apiClient.patch(`/applications/${applicationId}/withdraw`, {
      reason,
    });
    return res.data.data;
  },

  // Employer get applicants for a job
  getJobApplications: async (
    jobId: string,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<JobApplicationsResponse & { pagination: PaginationMeta }> => {
    const res = await apiClient.get(`/jobs/${jobId}/applications`, { params });
    return {
      ...res.data.data,
      pagination: res.data.meta?.pagination,
    };
  },

  // Employer accept / reject candidate
  updateApplicationStatus: async (
    applicationId: string,
    status: 'ACCEPTED' | 'REJECTED',
    reason?: string
  ): Promise<Application> => {
    const res = await apiClient.patch(`/applications/${applicationId}/status`, {
      status,
      reason,
    });
    return res.data.data;
  },
};
