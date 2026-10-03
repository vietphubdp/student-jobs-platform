export type JobStatus = 'DRAFT' | 'OPEN' | 'FILLED' | 'COMPLETED' | 'CLOSED';
export type SalaryUnit = 'HOUR' | 'DAY' | 'MONTH' | 'JOB';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface Job {
  id: string;
  employerId: string;
  categoryId: string;
  title: string;
  description: string;
  workTime: string;
  salaryMin: number;
  salaryMax?: number | null;
  salaryUnit: SalaryUnit;
  location: string;
  city: string;
  slots: number;
  deadline: string;
  status: JobStatus;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  category?: Category;
  employer?: {
    id: string;
    email: string;
    employerProfile?: {
      companyName: string;
      description?: string | null;
      phone?: string | null;
      address?: string | null;
      website?: string | null;
      isVerified: boolean;
    } | null;
  };
  _count?: {
    applications: number;
  };
  acceptedCount?: number;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  categoryId: string;
  workTime: string;
  salaryMin: number;
  salaryMax?: number | null;
  salaryUnit: SalaryUnit;
  location: string;
  city: string;
  slots: number;
  deadline: string;
  status?: 'DRAFT' | 'OPEN';
}

export interface UpdateJobPayload {
  title?: string;
  description?: string;
  categoryId?: string;
  workTime?: string;
  salaryMin?: number;
  salaryMax?: number | null;
  salaryUnit?: SalaryUnit;
  location?: string;
  city?: string;
  slots?: number;
  deadline?: string;
  status?: JobStatus;
}
