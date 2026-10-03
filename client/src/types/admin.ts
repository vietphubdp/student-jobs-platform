export interface AdminStats {
  users: {
    total: number;
    students: number;
    employers: number;
    banned: number;
  };
  jobs: {
    total: number;
    open: number;
    filled: number;
    completed: number;
    closed: number;
    hidden: number;
  };
  applications: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    withdrawn: number;
  };
  reviews: {
    total: number;
    hidden: number;
    averageRating: number;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'STUDENT' | 'EMPLOYER' | 'ADMIN';
  status: 'ACTIVE' | 'PENDING' | 'BANNED';
  createdAt: string;
  updatedAt: string;
  studentProfile?: {
    fullName: string;
    phone?: string | null;
    university?: string | null;
    major?: string | null;
  } | null;
  employerProfile?: {
    companyName: string;
    phone?: string | null;
    address?: string | null;
    isVerified: boolean;
  } | null;
  _count?: {
    employerJobs: number;
    applications: number;
    reviewsReceived: number;
  };
}

export interface AdminJob {
  id: string;
  title: string;
  description: string;
  employerId: string;
  categoryId: string;
  slots: number;
  status: 'DRAFT' | 'OPEN' | 'FILLED' | 'COMPLETED' | 'CLOSED';
  isHidden: boolean;
  salaryMin: number;
  salaryMax?: number | null;
  salaryUnit: 'HOUR' | 'DAY' | 'MONTH' | 'JOB';
  location: string;
  city: string;
  deadline: string;
  createdAt: string;
  category?: {
    id: string;
    name: string;
  };
  employer?: {
    id: string;
    email: string;
    employerProfile?: {
      companyName: string;
    } | null;
  };
  _count?: {
    applications: number;
  };
}

export interface AdminReview {
  id: string;
  applicationId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string | null;
  isHidden: boolean;
  createdAt: string;
  reviewer?: {
    id: string;
    role: string;
    studentProfile?: { fullName: string } | null;
    employerProfile?: { companyName: string } | null;
  };
  reviewee?: {
    id: string;
    role: string;
    studentProfile?: { fullName: string } | null;
    employerProfile?: { companyName: string } | null;
  };
  application?: {
    id: string;
    job?: {
      id: string;
      title: string;
    };
  };
}
