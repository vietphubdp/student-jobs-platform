import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { Role } from '@prisma/client';

describe('Auth Module & Role-Based Authorization', () => {
  const testStudentEmail = `test_sv_${Date.now()}@example.com`;
  const testEmployerEmail = `test_ntd_${Date.now()}@example.com`;
  const testPassword = 'Password@123';

  let studentCookie: string;
  let employerCookie: string;

  afterAll(async () => {
    // Clean test users
    await prisma.studentProfile.deleteMany({ where: { user: { email: testStudentEmail } } });
    await prisma.employerProfile.deleteMany({ where: { user: { email: testEmployerEmail } } });
    await prisma.user.deleteMany({
      where: {
        email: { in: [testStudentEmail, testEmployerEmail] },
      },
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new STUDENT successfully and set httpOnly cookie', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: testStudentEmail,
          password: testPassword,
          role: Role.STUDENT,
          fullName: 'Nguyễn Văn Test',
          university: 'Đại học Bách Khoa',
          major: 'Kỹ thuật Phần mềm',
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user.email).toBe(testStudentEmail);
      expect(res.body.data.user.role).toBe(Role.STUDENT);
      expect(res.body.data.user).not.toHaveProperty('passwordHash');
      expect(res.body.data.user.studentProfile.fullName).toBe('Nguyễn Văn Test');

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=/);
      expect(cookies[0]).toMatch(/HttpOnly/i);

      studentCookie = cookies[0];
    });

    it('should register a new EMPLOYER successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmployerEmail,
          password: testPassword,
          role: Role.EMPLOYER,
          companyName: 'Công ty Công nghệ ABC',
          phone: '0912345678',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.email).toBe(testEmployerEmail);
      expect(res.body.data.user.role).toBe(Role.EMPLOYER);
      expect(res.body.data.user.employerProfile.companyName).toBe('Công ty Công nghệ ABC');

      employerCookie = res.headers['set-cookie'][0];
    });

    it('should reject registration with existing email (409)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: testStudentEmail,
          password: testPassword,
          role: Role.STUDENT,
          fullName: 'Trùng Email',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('EMAIL_EXISTS');
    });

    it('should reject registration with password < 8 characters (400)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'short_pwd@example.com',
          password: '123',
          role: Role.STUDENT,
          fullName: 'Test Short Pwd',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject registration with invalid role like ADMIN (BR7)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'fake_admin@example.com',
          password: testPassword,
          role: 'ADMIN',
          fullName: 'Fake Admin',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testStudentEmail,
          password: testPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(testStudentEmail);
      expect(res.body.data.user).not.toHaveProperty('passwordHash');

      const cookies = res.headers['set-cookie'];
      expect(cookies[0]).toMatch(/token=/);
    });

    it('should reject login with wrong password (401)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testStudentEmail,
          password: 'WrongPassword@123',
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return authenticated user profile when cookie is present', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', studentCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(testStudentEmail);
      expect(res.body.data.user.role).toBe(Role.STUDENT);
    });

    it('should return 401 when no token/cookie is provided', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear token cookie on logout', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', studentCookie);

      expect(res.status).toBe(200);
      const cookies = res.headers['set-cookie'];
      expect(cookies[0]).toMatch(/token=;/);
    });
  });
});
