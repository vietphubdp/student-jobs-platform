import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../utils/response';
import { setAuthCookie, clearAuthCookie } from '../../utils/jwt';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await authService.register(req.body);
      setAuthCookie(res, token);
      return sendSuccess(res, { user }, 201);
    } catch (error) {
      return next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await authService.login(req.body);
      setAuthCookie(res, token);
      return sendSuccess(res, { user }, 200);
    } catch (error) {
      return next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      clearAuthCookie(res);
      return sendSuccess(res, { message: 'Đăng xuất thành công' }, 200);
    } catch (error) {
      return next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await authService.getMe(userId);
      return sendSuccess(res, { user }, 200);
    } catch (error) {
      return next(error);
    }
  }
}

export const authController = new AuthController();
