import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/student_jobs?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_job_sv_2026_default_dev',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || 'localhost',
  REQUIRE_EMPLOYER_APPROVAL: process.env.REQUIRE_EMPLOYER_APPROVAL === 'true',
  NODE_ENV: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
};
