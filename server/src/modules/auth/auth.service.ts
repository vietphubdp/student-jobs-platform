import bcrypt from 'bcrypt';
import { Role, UserStatus } from '@prisma/client';
import { prisma } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { signToken } from '../../utils/jwt';
import { RegisterInput, LoginInput } from './auth.schema';
import { env } from '../../config/env';

export class AuthService {
  async register(input: RegisterInput) {
    const { email, password, role, fullName, university, major, companyName, phone, address } = input;

    // 1. Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError('Email này đã được đăng ký trên hệ thống', 409, 'EMAIL_EXISTS');
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Determine status (If REQUIRE_EMPLOYER_APPROVAL is true and role is EMPLOYER, status is PENDING)
    let initialStatus: UserStatus = UserStatus.ACTIVE;
    if (role === Role.EMPLOYER && env.REQUIRE_EMPLOYER_APPROVAL) {
      initialStatus = UserStatus.PENDING;
    }

    // 4. Create user and profile in transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          role,
          status: initialStatus,
          ...(role === Role.STUDENT
            ? {
                studentProfile: {
                  create: {
                    fullName: fullName || '',
                    university: university || null,
                    major: major || null,
                    phone: phone || null,
                    skills: [],
                  },
                },
              }
            : {
                employerProfile: {
                  create: {
                    companyName: companyName || '',
                    phone: phone || null,
                    address: address || null,
                    isVerified: false,
                  },
                },
              }),
        },
        include: {
          studentProfile: true,
          employerProfile: true,
        },
      });

      return newUser;
    });

    // 5. Generate Token
    const token = signToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    // 6. Return sanitized user
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        studentProfile: user.studentProfile,
        employerProfile: user.employerProfile,
      },
    };
  }

  async login(input: LoginInput) {
    const { email, password } = input;

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        studentProfile: true,
        employerProfile: true,
      },
    });

    if (!user) {
      throw new AppError('Email hoặc mật khẩu không chính xác', 401, 'INVALID_CREDENTIALS');
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Email hoặc mật khẩu không chính xác', 401, 'INVALID_CREDENTIALS');
    }

    // 3. Check user status
    if (user.status === UserStatus.BANNED) {
      throw new AppError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.', 403, 'ACCOUNT_BANNED');
    }

    // 4. Generate Token
    const token = signToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    // 5. Return sanitized user
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        studentProfile: user.studentProfile,
        employerProfile: user.employerProfile,
      },
    };
  }

  async getMe(userId: string) {
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
}

export const authService = new AuthService();
