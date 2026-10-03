import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env';
import { prisma } from './config/db';
import { sendSuccess } from './utils/response';
import { AppError } from './utils/AppError';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration for cookies & frontend communication
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static folder for uploaded files (CVs, etc.)
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

import authRoutes from './modules/auth/auth.routes';
import profileRoutes from './modules/profile/profile.routes';
import jobRoutes from './modules/job/job.routes';
import applicationRoutes from './modules/application/application.routes';
import reviewRoutes from './modules/review/review.routes';
import notificationRoutes from './modules/notification/notification.routes';
import adminRoutes from './modules/admin/admin.routes';

// Health Check endpoint
app.get('/api/health', async (req: Request, res: Response, next) => {
  try {
    // Check DB connection
    await prisma.$queryRaw`SELECT 1`;
    return sendSuccess(res, {
      status: 'ok',
      service: 'student-jobs-api',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: env.NODE_ENV,
    });
  } catch (error) {
    return next(new AppError('Không thể kết nối tới cơ sở dữ liệu', 503, 'SERVICE_UNAVAILABLE', error));
  }
});

// API Modules
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', applicationRoutes);
app.use('/api', reviewRoutes);
app.use('/api', notificationRoutes);
app.use('/api', jobRoutes);

// Handle 404
app.use('/api/*', (req: Request, res: Response, next) => {
  next(new AppError(`Không tìm thấy endpoint: ${req.method} ${req.baseUrl}`, 404, 'NOT_FOUND'));
});

// Centralized error handler
app.use(errorHandler);

export default app;
