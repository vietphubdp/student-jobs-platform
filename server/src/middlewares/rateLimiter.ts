import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response';
import { env } from '../config/env';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'test' ? 1000 : 20, // Limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      429,
      'TOO_MANY_REQUESTS',
      'Bạn đã gửi quá nhiều yêu cầu đăng nhập/đăng ký. Vui lòng thử lại sau 15 phút.'
    );
  },
});
