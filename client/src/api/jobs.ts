import { apiClient, ApiResponse } from './client';
import { Job, Category, CreateJobPayload, UpdateJobPayload, JobStatus } from '../types/job';

export const jobApi = {
  getPublicJobs: async (params?: {
    q?: string;
    category?: string;
    city?: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryUnit?: string;
    status?: JobStatus;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ jobs: Job[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
    const response = await apiClient.get<ApiResponse<{ jobs: Job[] }>>('/jobs', {
      params,
    });
    return {
      jobs: response.data.data.jobs,
      pagination: (response.data.meta as any)?.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 },
    };
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<{ categories: Category[] }>>('/categories');
    return response.data.data.categories;
  },

  getEmployerJobs: async (params?: {
    status?: JobStatus;
    page?: number;
    limit?: number;
  }): Promise<{ jobs: Job[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
    const response = await apiClient.get<ApiResponse<{ jobs: Job[] }>>('/employer/jobs', {
      params,
    });
    return {
      jobs: response.data.data.jobs,
      pagination: (response.data.meta as any)?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
    };
  },

  getJobById: async (id: string): Promise<Job> => {
    const response = await apiClient.get<ApiResponse<{ job: Job }>>(`/jobs/${id}`);
    return response.data.data.job;
  },

  createJob: async (payload: CreateJobPayload): Promise<Job> => {
    const response = await apiClient.post<ApiResponse<{ job: Job }>>('/jobs', payload);
    return response.data.data.job;
  },

  updateJob: async (id: string, payload: UpdateJobPayload): Promise<Job> => {
    const response = await apiClient.put<ApiResponse<{ job: Job }>>(`/jobs/${id}`, payload);
    return response.data.data.job;
  },

  changeJobStatus: async (id: string, status: JobStatus): Promise<Job> => {
    const response = await apiClient.patch<ApiResponse<{ job: Job }>>(`/jobs/${id}/status`, { status });
    return response.data.data.job;
  },

  deleteJob: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/jobs/${id}`);
    return response.data.data;
  },
};
