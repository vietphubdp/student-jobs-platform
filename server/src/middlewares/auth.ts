import { Request, Response, NextFunction } from 'express';
import { Role, UserStatus } from '@prisma/client';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../config/db';
import { AppError } from '../utils/AppError';

// Augment Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        status: UserStatus;
        studentProfile?: any;
        employerProfile?: any;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Get token from httpOnly cookie or Bearer header
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.', 401, 'UNAUTHORIZED');
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      throw new AppError('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.', 401, 'UNAUTHORIZED');
    }

    // 3. Find user in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        studentProfile: true,
        employerProfile: true,
      },
    });

    if (!user) {
      throw new AppError('Tài khoản không tồn tại trên hệ thống.', 401, 'USER_NOT_FOUND');
    }

    if (user.status === UserStatus.BANNED) {
      throw new AppError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.', 403, 'ACCOUNT_BANNED');
    }

    // 4. Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      studentProfile: user.studentProfile,
      employerProfile: user.employerProfile,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Bạn chưa đăng nhập.', 401, 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          'Bạn không có quyền thực hiện hành động này.',
          403,
          'FORBIDDEN'
        )
      );
    }

    return next();
  };
};
