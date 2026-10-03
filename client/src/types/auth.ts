export type Role = 'STUDENT' | 'EMPLOYER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'BANNED';

export interface StudentProfile {
  userId: string;
  fullName: string;
  phone?: string | null;
  university?: string | null;
  major?: string | null;
  bio?: string | null;
  cvUrl?: string | null;
  skills: string[];
}

export interface EmployerProfile {
  userId: string;
  companyName: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  isVerified: boolean;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  studentProfile?: StudentProfile | null;
  employerProfile?: EmployerProfile | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: Role;
  fullName?: string;
  university?: string;
  major?: string;
  companyName?: string;
  phone?: string;
  address?: string;
}
