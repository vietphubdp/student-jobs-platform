import { Role } from '@prisma/client';
import { prisma } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { UpdateStudentProfileInput, UpdateEmployerProfileInput } from './profile.schema';

export class ProfileService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        employerProfile: true,
      },
    });

    if (!user) {
      throw new AppError('Không tìm thấy người dùng', 404, 'USER_NOT_FOUND');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      studentProfile: user.studentProfile,
      employerProfile: user.employerProfile,
    };
  }

  async updateStudentProfile(userId: string, data: UpdateStudentProfileInput) {
    const profile = await prisma.studentProfile.upsert({
      where: { userId },
      update: {
        ...(data.fullName !== undefined && { fullName: data.fullName }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.university !== undefined && { university: data.university }),
        ...(data.major !== undefined && { major: data.major }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.skills !== undefined && { skills: data.skills }),
        ...(data.cvUrl !== undefined && { cvUrl: data.cvUrl }),
      },
      create: {
        userId,
        fullName: data.fullName || '',
        phone: data.phone || null,
        university: data.university || null,
        major: data.major || null,
        bio: data.bio || null,
        skills: data.skills || [],
        cvUrl: data.cvUrl || null,
      },
    });

    return profile;
  }

  async updateEmployerProfile(userId: string, data: UpdateEmployerProfileInput) {
    const profile = await prisma.employerProfile.upsert({
      where: { userId },
      update: {
        ...(data.companyName !== undefined && { companyName: data.companyName }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.website !== undefined && { website: data.website || null }),
      },
      create: {
        userId,
        companyName: data.companyName || '',
        description: data.description || null,
        address: data.address || null,
        phone: data.phone || null,
        website: data.website || null,
        isVerified: false,
      },
    });

    return profile;
  }

  async updateCv(userId: string, filename: string) {
    const cvUrl = `/uploads/${filename}`;
    const profile = await prisma.studentProfile.update({
      where: { userId },
      data: { cvUrl },
    });

    return {
      cvUrl: profile.cvUrl,
      fileName: filename,
    };
  }
}

export const profileService = new ProfileService();
