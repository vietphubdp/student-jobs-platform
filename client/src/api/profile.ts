import { apiClient, ApiResponse } from './client';
import { User, StudentProfile, EmployerProfile } from '../types/auth';

export const profileApi = {
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<{ profile: User }>>('/profile/me');
    return response.data.data.profile;
  },

  updateProfile: async (data: Partial<StudentProfile | EmployerProfile>): Promise<StudentProfile | EmployerProfile> => {
    const response = await apiClient.put<ApiResponse<{ profile: StudentProfile | EmployerProfile }>>('/profile/me', data);
    return response.data.data.profile;
  },

  uploadCv: async (file: File): Promise<{ cvUrl: string; fileName: string }> => {
    const formData = new FormData();
    formData.append('cv', file);

    const response = await apiClient.post<ApiResponse<{ cvUrl: string; fileName: string }>>(
      '/profile/cv',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },
};
