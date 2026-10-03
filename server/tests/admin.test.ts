import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { Role, UserStatus, JobStatus, SalaryUnit } from '@prisma/client';
import bcrypt from 'bcrypt';

describe('Admin Module (Giai đoạn 9 - RBAC & Moderation)', () => {
  const timestamp = Date.now();
  const adminEmail = `admin_test_${timestamp}@test.com`;
  const employerEmail = `emp_admin_test_${timestamp}@test.com`;
  const studentEmail = `stu_admin_test_${timestamp}@test.com`;
  const password = 'Password@123';

  let adminId: string;
  let employerId: string;
  let studentId: string;

  let adminCookie: string;
  let employerCookie: string;
  let studentCookie: string;

  let jobId: string;
  let reviewId: string;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash(password, 10);

    // 1. Create Admin
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });
    adminId = admin.id;

    // Login as Admin to get cookie
    const resAdminLogin = await request(app).post('/api/auth/login').send({
      email: adminEmail,
      password,
    });
    adminCookie = resAdminLogin.headers['set-cookie'][0];

    // 2. Register Employer
    const resEmp = await request(app).post('/api/auth/register').send({
      email: employerEmail,
      password,
      role: Role.EMPLOYER,
      companyName: 'Công ty Cổ phần Admin Test',
    });
    employerCookie = resEmp.headers['set-cookie'][0];
    employerId = resEmp.body.data.user.id;

    // 3. Register Student
    const resStu = await request(app).post('/api/auth/register').send({
      email: studentEmail,
      password,
      role: Role.STUDENT,
      fullName: 'Nguyễn Văn Admin Test',
    });
    studentCookie = resStu.headers['set-cookie'][0];
    studentId = resStu.body.data.user.id;

    // 4. Create Category & Job
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({ data: { name: `Ngành Admin ${timestamp}` } });
    }

    const deadline = new Date(Date.now() + 86400000 * 7).toISOString();
    const resJob = await request(app)
      .post('/api/jobs')
      .set('Cookie', employerCookie)
      .send({
        title: 'Công việc Admin Kiểm duyệt Test',
        description: 'Mô tả công việc kiểm duyệt',
        categoryId: category.id,
        workTime: 'Ca chiều',
        salaryMin: 30000,
        salaryUnit: SalaryUnit.HOUR,
        location: '789 Đường Test, Quận 5',
        city: 'Hồ Chí Minh',
        slots: 1,
        deadline,
        status: JobStatus.OPEN,
      });
    jobId = resJob.body.data.job.id;

    // 5. Create Application, Accept, Complete, and Review
    const resApp = await request(app)
      .post(`/api/jobs/${jobId}/applications`)
      .set('Cookie', studentCookie)
      .send({ coverLetter: 'Đơn ứng tuyển' });
    const appId = resApp.body.data.id;

    await request(app)
      .patch(`/api/applications/${appId}/status`)
      .set('Cookie', employerCookie)
      .send({ status: 'ACCEPTED' });

    await request(app)
      .patch(`/api/jobs/${jobId}/status`)
      .set('Cookie', employerCookie)
      .send({ status: 'COMPLETED' });

    const resReview = await request(app)
      .post(`/api/applications/${appId}/reviews`)
      .set('Cookie', studentCookie)
      .send({ rating: 5, comment: 'Đánh giá để kiểm duyệt' });
    reviewId = resReview.body.data.id;
  });

  describe('Admin Authorization (401 / 403 checks)', () => {
    it('should reject unauthenticated request to /api/admin/stats (401)', async () => {
      const res = await request(app).get('/api/admin/stats');
      expect(res.status).toBe(401);
    });

    it('should reject student accessing /api/admin/stats (403)', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Cookie', studentCookie);
      expect(res.status).toBe(403);
    });

    it('should reject employer accessing /api/admin/stats (403)', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Cookie', employerCookie);
      expect(res.status).toBe(403);
    });
  });

  describe('Admin Stats API (GET /api/admin/stats)', () => {
    it('should return system-wide stats for ADMIN (200)', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.users.total).toBeGreaterThanOrEqual(3);
      expect(res.body.data.jobs.total).toBeGreaterThanOrEqual(1);
      expect(res.body.data.applications.total).toBeGreaterThanOrEqual(1);
      expect(res.body.data.reviews.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Admin User Management (GET/PATCH /api/admin/users)', () => {
    it('should list all users with pagination and role filters', async () => {
      const res = await request(app)
        .get('/api/admin/users?role=STUDENT')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.every((u: any) => u.role === 'STUDENT')).toBe(true);
    });

    it('should search users by keyword', async () => {
      const res = await request(app)
        .get(`/api/admin/users?q=${studentEmail}`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].email).toBe(studentEmail);
    });

    it('should update user status to BANNED and then back to ACTIVE', async () => {
      // Ban student
      const resBan = await request(app)
        .patch(`/api/admin/users/${studentId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: UserStatus.BANNED });

      expect(resBan.status).toBe(200);
      expect(resBan.body.data.status).toBe('BANNED');

      // Unban student
      const resUnban = await request(app)
        .patch(`/api/admin/users/${studentId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: UserStatus.ACTIVE });

      expect(resUnban.status).toBe(200);
      expect(resUnban.body.data.status).toBe('ACTIVE');
    });

    it('should prevent admin from banning their own account (400 CANNOT_BAN_SELF)', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${adminId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: UserStatus.BANNED });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('CANNOT_BAN_SELF');
    });
  });

  describe('Admin Job Moderation (GET/PATCH /api/admin/jobs)', () => {
    it('should list all jobs for admin', async () => {
      const res = await request(app)
        .get('/api/admin/jobs')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should hide and unhide a job', async () => {
      // Hide job
      const resHide = await request(app)
        .patch(`/api/admin/jobs/${jobId}/hide`)
        .set('Cookie', adminCookie)
        .send({ isHidden: true });

      expect(resHide.status).toBe(200);
      expect(resHide.body.data.isHidden).toBe(true);

      // Verify hidden job does not appear in public job list
      const resPublic = await request(app).get('/api/jobs');
      const found = resPublic.body.data.jobs.find((j: any) => j.id === jobId);
      expect(found).toBeUndefined();

      // Unhide job
      const resUnhide = await request(app)
        .patch(`/api/admin/jobs/${jobId}/hide`)
        .set('Cookie', adminCookie)
        .send({ isHidden: false });

      expect(resUnhide.status).toBe(200);
      expect(resUnhide.body.data.isHidden).toBe(false);
    });
  });

  describe('Admin Review Moderation (GET/PATCH /api/admin/reviews, BR6)', () => {
    it('should list reviews for admin', async () => {
      const res = await request(app)
        .get('/api/admin/reviews')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should hide review (BR6) and exclude it from public user reviews calculation', async () => {
      // Hide review
      const resHide = await request(app)
        .patch(`/api/admin/reviews/${reviewId}/hide`)
        .set('Cookie', adminCookie)
        .send({ isHidden: true });

      expect(resHide.status).toBe(200);
      expect(resHide.body.data.isHidden).toBe(true);

      // Verify hidden review is excluded from public reviews list of employer
      const resUserReviews = await request(app).get(`/api/users/${employerId}/reviews`);
      expect(resUserReviews.status).toBe(200);
      const found = resUserReviews.body.data.reviews.find((r: any) => r.id === reviewId);
      expect(found).toBeUndefined();

      // Unhide review
      const resUnhide = await request(app)
        .patch(`/api/admin/reviews/${reviewId}/hide`)
        .set('Cookie', adminCookie)
        .send({ isHidden: false });

      expect(resUnhide.status).toBe(200);
      expect(resUnhide.body.data.isHidden).toBe(false);
    });
  });
});
