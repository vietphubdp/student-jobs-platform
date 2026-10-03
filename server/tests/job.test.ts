import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { Role, JobStatus, SalaryUnit } from '@prisma/client';
import { canJobTransition } from '../src/modules/job/job.state-machine';

describe('Job Module & State Machine', () => {
  describe('Pure Function canJobTransition', () => {
    it('should allow valid transitions', () => {
      expect(canJobTransition(JobStatus.DRAFT, JobStatus.OPEN)).toBe(true);
      expect(canJobTransition(JobStatus.DRAFT, JobStatus.CLOSED)).toBe(true);
      expect(canJobTransition(JobStatus.OPEN, JobStatus.FILLED)).toBe(true);
      expect(canJobTransition(JobStatus.OPEN, JobStatus.CLOSED)).toBe(true);
      expect(canJobTransition(JobStatus.FILLED, JobStatus.OPEN)).toBe(true);
      expect(canJobTransition(JobStatus.FILLED, JobStatus.COMPLETED)).toBe(true);
      expect(canJobTransition(JobStatus.FILLED, JobStatus.CLOSED)).toBe(true);
    });

    it('should reject invalid transitions from terminal states', () => {
      expect(canJobTransition(JobStatus.CLOSED, JobStatus.OPEN)).toBe(false);
      expect(canJobTransition(JobStatus.CLOSED, JobStatus.FILLED)).toBe(false);
      expect(canJobTransition(JobStatus.COMPLETED, JobStatus.OPEN)).toBe(false);
      expect(canJobTransition(JobStatus.COMPLETED, JobStatus.CLOSED)).toBe(false);
    });
  });

  describe('Job API Integration', () => {
    const employer1Email = `job_test_emp1_${Date.now()}@example.com`;
    const employer2Email = `job_test_emp2_${Date.now()}@example.com`;
    const password = 'Password@123';

    let employer1Cookie: string;
    let employer2Cookie: string;
    let categoryId: string;
    let createdJobId: string;

    beforeAll(async () => {
      // 1. Get or create category
      let category = await prisma.category.findFirst();
      if (!category) {
        category = await prisma.category.create({ data: { name: 'Test Category' } });
      }
      categoryId = category.id;

      // 2. Register Employer 1
      const res1 = await request(app).post('/api/auth/register').send({
        email: employer1Email,
        password,
        role: Role.EMPLOYER,
        companyName: 'Công ty Test Job 1',
      });
      employer1Cookie = res1.headers['set-cookie'][0];

      // 3. Register Employer 2
      const res2 = await request(app).post('/api/auth/register').send({
        email: employer2Email,
        password,
        role: Role.EMPLOYER,
        companyName: 'Công ty Test Job 2',
      });
      employer2Cookie = res2.headers['set-cookie'][0];
    });

    afterAll(async () => {
      await prisma.job.deleteMany({
        where: { employer: { email: { in: [employer1Email, employer2Email] } } },
      });
      await prisma.employerProfile.deleteMany({
        where: { user: { email: { in: [employer1Email, employer2Email] } } },
      });
      await prisma.user.deleteMany({
        where: { email: { in: [employer1Email, employer2Email] } },
      });
    });

    it('should allow EMPLOYER to create a new Job (POST /api/jobs)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);

      const res = await request(app)
        .post('/api/jobs')
        .set('Cookie', employer1Cookie)
        .send({
          title: 'Nhân viên Phục vụ Part-time',
          description: 'Cần tuyển 2 bạn sinh viên làm ca tối tại quán cà phê.',
          categoryId,
          workTime: 'Ca tối 18h-22h',
          salaryMin: 30000,
          salaryMax: 35000,
          salaryUnit: SalaryUnit.HOUR,
          location: '123 Lê Lợi',
          city: 'TP. Hồ Chí Minh',
          slots: 2,
          deadline: futureDate.toISOString(),
          status: JobStatus.OPEN,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.job).toHaveProperty('id');
      expect(res.body.data.job.title).toBe('Nhân viên Phục vụ Part-time');
      expect(res.body.data.job.status).toBe(JobStatus.OPEN);
      expect(res.body.data.job.slots).toBe(2);

      createdJobId = res.body.data.job.id;
    });

    it('should get list of employer jobs (GET /api/employer/jobs)', async () => {
      const res = await request(app)
        .get('/api/employer/jobs')
        .set('Cookie', employer1Cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.jobs.length).toBeGreaterThanOrEqual(1);
      expect(res.body.meta).toHaveProperty('pagination');
    });

    it('should search and filter public jobs (GET /api/jobs)', async () => {
      // 1. Get all public jobs
      const resAll = await request(app).get('/api/jobs');
      expect(resAll.status).toBe(200);
      expect(resAll.body.data).toHaveProperty('jobs');
      expect(resAll.body.meta).toHaveProperty('pagination');

      // 2. Search by query 'Phục vụ'
      const resSearch = await request(app).get('/api/jobs?q=Phục');
      expect(resSearch.status).toBe(200);
      expect(resSearch.body.data.jobs.length).toBeGreaterThanOrEqual(1);

      // 3. Filter by city
      const resCity = await request(app).get('/api/jobs?city=Hồ Chí Minh');
      expect(resCity.status).toBe(200);
      expect(resCity.body.data.jobs.length).toBeGreaterThanOrEqual(1);

      // 4. Filter by category
      const resCat = await request(app).get(`/api/jobs?category=${categoryId}`);
      expect(resCat.status).toBe(200);
      expect(resCat.body.data.jobs.length).toBeGreaterThanOrEqual(1);

      // 5. Sort by salary desc
      const resSort = await request(app).get('/api/jobs?sort=salary_desc');
      expect(resSort.status).toBe(200);
    });

    it('should get job detail by id (GET /api/jobs/:id)', async () => {
      const res = await request(app).get(`/api/jobs/${createdJobId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.job.id).toBe(createdJobId);
      expect(res.body.data.job).toHaveProperty('employer');
    });

    it('should reject non-owner employer from updating the job (BR3 - 403 FORBIDDEN)', async () => {
      const res = await request(app)
        .put(`/api/jobs/${createdJobId}`)
        .set('Cookie', employer2Cookie)
        .send({
          title: 'Hacker sửa job',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should allow owner to update job information (PUT /api/jobs/:id)', async () => {
      const res = await request(app)
        .put(`/api/jobs/${createdJobId}`)
        .set('Cookie', employer1Cookie)
        .send({
          title: 'Nhân viên Phục vụ Ca Tối Cập Nhật',
          salaryMin: 32000,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.job.title).toBe('Nhân viên Phục vụ Ca Tối Cập Nhật');
      expect(res.body.data.job.salaryMin).toBe(32000);
    });

    it('should transition job status OPEN -> CLOSED successfully', async () => {
      const res = await request(app)
        .patch(`/api/jobs/${createdJobId}/status`)
        .set('Cookie', employer1Cookie)
        .send({ status: JobStatus.CLOSED });

      expect(res.status).toBe(200);
      expect(res.body.data.job.status).toBe(JobStatus.CLOSED);
    });

    it('should reject invalid transition from CLOSED -> OPEN with 400', async () => {
      const res = await request(app)
        .patch(`/api/jobs/${createdJobId}/status`)
        .set('Cookie', employer1Cookie)
        .send({ status: JobStatus.OPEN });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_STATE_TRANSITION');
    });

    it('should allow transitioning job to COMPLETED, setting completedAt, and notifying accepted students', async () => {
      // Create a student, apply and accept
      const studentEmail = `job_complete_std_${Date.now()}@example.com`;
      const stdRes = await request(app).post('/api/auth/register').send({
        email: studentEmail,
        password,
        role: Role.STUDENT,
        fullName: 'Sinh viên Test Completed',
      });
      const studentCookie = stdRes.headers['set-cookie'][0];
      const studentId = stdRes.body.data.user.id;

      // Create a new job
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const newJobRes = await request(app)
        .post('/api/jobs')
        .set('Cookie', employer1Cookie)
        .send({
          title: 'Job Hoàn thành Thử nghiệm',
          description: 'Mô tả job thử nghiệm hoàn thành',
          categoryId,
          workTime: 'Ca chiều',
          salaryMin: 50000,
          salaryUnit: SalaryUnit.HOUR,
          location: 'Hà Nội',
          city: 'Hà Nội',
          slots: 1,
          deadline: futureDate.toISOString(),
          status: JobStatus.OPEN,
        });
      const jobId = newJobRes.body.data.job.id;

      // Student applies
      const applyRes = await request(app)
        .post(`/api/jobs/${jobId}/applications`)
        .set('Cookie', studentCookie)
        .send({ coverLetter: 'Em muốn làm việc này ạ' });
      const appId = applyRes.body.data.id;

      // Employer accepts
      await request(app)
        .patch(`/api/applications/${appId}/status`)
        .set('Cookie', employer1Cookie)
        .send({ status: 'ACCEPTED' });

      // Employer completes the job (FILLED/OPEN -> COMPLETED)
      const completeRes = await request(app)
        .patch(`/api/jobs/${jobId}/status`)
        .set('Cookie', employer1Cookie)
        .send({ status: JobStatus.COMPLETED });

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.data.job.status).toBe(JobStatus.COMPLETED);
      expect(completeRes.body.data.job.completedAt).toBeDefined();

      // Check notification generated for student (BR9)
      const notification = await prisma.notification.findFirst({
        where: {
          userId: studentId,
          type: 'JOB_COMPLETED',
        },
      });
      expect(notification).toBeDefined();
      expect(notification?.title).toContain('hoàn thành');

      // Clean up
      await prisma.notification.deleteMany({ where: { userId: studentId } });
      await prisma.application.deleteMany({ where: { jobId } });
      await prisma.job.delete({ where: { id: jobId } });
      await prisma.studentProfile.deleteMany({ where: { userId: studentId } });
      await prisma.user.delete({ where: { id: studentId } });
    });

    it('should allow owner to delete job (DELETE /api/jobs/:id)', async () => {
      const res = await request(app)
        .delete(`/api/jobs/${createdJobId}`)
        .set('Cookie', employer1Cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBeDefined();
    });
  });
});
