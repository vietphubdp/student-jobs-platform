import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { Role, ApplicationStatus, JobStatus, SalaryUnit } from '@prisma/client';
import { canApplicationTransition } from '../src/modules/application/application.state-machine';

describe('Application Module & Transaction Concurrency', () => {
  describe('Pure Function canApplicationTransition', () => {
    it('should allow valid application state transitions', () => {
      expect(canApplicationTransition(ApplicationStatus.PENDING, ApplicationStatus.ACCEPTED)).toBe(true);
      expect(canApplicationTransition(ApplicationStatus.PENDING, ApplicationStatus.REJECTED)).toBe(true);
      expect(canApplicationTransition(ApplicationStatus.PENDING, ApplicationStatus.WITHDRAWN)).toBe(true);
      expect(canApplicationTransition(ApplicationStatus.ACCEPTED, ApplicationStatus.WITHDRAWN)).toBe(true);
      expect(canApplicationTransition(ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED)).toBe(true);
    });

    it('should reject invalid application transitions', () => {
      expect(canApplicationTransition(ApplicationStatus.REJECTED, ApplicationStatus.ACCEPTED)).toBe(false);
      expect(canApplicationTransition(ApplicationStatus.WITHDRAWN, ApplicationStatus.ACCEPTED)).toBe(false);
      expect(canApplicationTransition(ApplicationStatus.REJECTED, ApplicationStatus.PENDING)).toBe(false);
    });
  });

  describe('Application Workflow & Business Rules', () => {
    const timestamp = Date.now();
    const employerEmail = `app_emp_${timestamp}@test.com`;
    const otherEmployerEmail = `app_other_emp_${timestamp}@test.com`;
    const student1Email = `app_stu1_${timestamp}@test.com`;
    const student2Email = `app_stu2_${timestamp}@test.com`;
    const student3Email = `app_stu3_${timestamp}@test.com`;
    const password = 'Password@123';

    let employerCookie: string;
    let otherEmployerCookie: string;
    let student1Cookie: string;
    let student2Cookie: string;
    let student3Cookie: string;
    let categoryId: string;
    let jobId: string; // Job with slots = 1

    beforeAll(async () => {
      // Category
      let category = await prisma.category.findFirst();
      if (!category) {
        category = await prisma.category.create({ data: { name: 'IT / Lập trình Test' } });
      }
      categoryId = category.id;

      // Employer 1
      const resEmp = await request(app).post('/api/auth/register').send({
        email: employerEmail,
        password,
        role: Role.EMPLOYER,
        companyName: 'Công ty Tuyển Dụng App Test',
      });
      employerCookie = resEmp.headers['set-cookie'][0];

      // Other Employer
      const resOtherEmp = await request(app).post('/api/auth/register').send({
        email: otherEmployerEmail,
        password,
        role: Role.EMPLOYER,
        companyName: 'Công ty Khác',
      });
      otherEmployerCookie = resOtherEmp.headers['set-cookie'][0];

      // Student 1
      const resStu1 = await request(app).post('/api/auth/register').send({
        email: student1Email,
        password,
        role: Role.STUDENT,
        fullName: 'Nguyễn Văn Sinh Viên 1',
      });
      student1Cookie = resStu1.headers['set-cookie'] ? resStu1.headers['set-cookie'][0] : '';

      // Student 2
      const resStu2 = await request(app).post('/api/auth/register').send({
        email: student2Email,
        password,
        role: Role.STUDENT,
        fullName: 'Trần Thị Sinh Viên 2',
      });
      student2Cookie = resStu2.headers['set-cookie'][0];

      // Student 3
      const resStu3 = await request(app).post('/api/auth/register').send({
        email: student3Email,
        password,
        role: Role.STUDENT,
        fullName: 'Lê Văn Sinh Viên 3',
      });
      student3Cookie = resStu3.headers['set-cookie'][0];

      // Create a Job with slots = 1
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 10);

      const jobRes = await request(app)
        .post('/api/jobs')
        .set('Cookie', employerCookie)
        .send({
          title: 'Gia sư Lập trình NodeJS (1 slot)',
          description: 'Cần tuyển 1 bạn SV dạy kèm cơ bản',
          categoryId,
          workTime: '2 buổi/tuần',
          salaryMin: 100000,
          salaryMax: 150000,
          salaryUnit: SalaryUnit.HOUR,
          location: 'Cầu Giấy',
          city: 'Hà Nội',
          slots: 1,
          deadline: deadline.toISOString(),
          status: 'OPEN',
        });

      if (jobRes.status !== 201) {
        console.error('JOB CREATE ERROR IN TEST BEFOREALL:', jobRes.status, jobRes.body);
      }
      expect(jobRes.status).toBe(201);
      jobId = jobRes.body.data.job.id;
    });

    let student1AppId: string;
    let student2AppId: string;

    it('should allow Student 1 to apply for the OPEN job', async () => {
      const res = await request(app)
        .post(`/api/jobs/${jobId}/applications`)
        .set('Cookie', student1Cookie)
        .send({
          coverLetter: 'Em có kinh nghiệm 1 năm NodeJS, rất mong được nhận công việc.',
        });

      if (res.status !== 201) {
        console.error('APPLY RESULT ERROR:', res.status, res.body);
      }

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.status).toBe(ApplicationStatus.PENDING);
      student1AppId = res.body.data.id;
    });

    it('BR1: should reject duplicate application from Student 1', async () => {
      const res = await request(app)
        .post(`/api/jobs/${jobId}/applications`)
        .set('Cookie', student1Cookie)
        .send({
          coverLetter: 'Em nộp lại lần nữa',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('DUPLICATE_APPLICATION');
    });

    it('should allow Student 2 to apply for the job as well', async () => {
      const res = await request(app)
        .post(`/api/jobs/${jobId}/applications`)
        .set('Cookie', student2Cookie)
        .send({
          coverLetter: 'Em cũng muốn ứng tuyển vị trí này ạ.',
        });

      expect(res.status).toBe(201);
      student2AppId = res.body.data.id;
    });

    it('should allow Student to view their own application list', async () => {
      const res = await request(app)
        .get('/api/student/applications')
        .set('Cookie', student1Cookie);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].jobId).toBe(jobId);
    });

    it('BR3: should reject unauthorized employer from viewing applicants', async () => {
      const res = await request(app)
        .get(`/api/jobs/${jobId}/applications`)
        .set('Cookie', otherEmployerCookie);

      expect(res.status).toBe(403);
    });

    it('BR3: should allow owner employer to view applicants and summary', async () => {
      const res = await request(app)
        .get(`/api/jobs/${jobId}/applications`)
        .set('Cookie', employerCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.summary.slots).toBe(1);
      expect(res.body.data.summary.totalApplications).toBe(2);
      expect(res.body.data.summary.pendingCount).toBe(2);
      expect(res.body.data.applications.length).toBe(2);
    });

    it('should accept Student 1 and automatically transition Job to FILLED when slot is met', async () => {
      const res = await request(app)
        .patch(`/api/applications/${student1AppId}/status`)
        .set('Cookie', employerCookie)
        .send({
          status: 'ACCEPTED',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(ApplicationStatus.ACCEPTED);

      // Verify Job status is now FILLED
      const jobCheck = await prisma.job.findUnique({ where: { id: jobId } });
      expect(jobCheck?.status).toBe(JobStatus.FILLED);
    });

    it('should reject accepting Student 2 because slots limit (1) is already reached', async () => {
      const res = await request(app)
        .patch(`/api/applications/${student2AppId}/status`)
        .set('Cookie', employerCookie)
        .send({
          status: 'ACCEPTED',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('JOB_SLOTS_FULL');
    });

    it('should allow Employer to reject Student 2 with a reason', async () => {
      const res = await request(app)
        .patch(`/api/applications/${student2AppId}/status`)
        .set('Cookie', employerCookie)
        .send({
          status: 'REJECTED',
          reason: 'Đã nhận đủ số lượng bạn cần tuyển đợt này.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(ApplicationStatus.REJECTED);
      expect(res.body.data.rejectReason).toBe('Đã nhận đủ số lượng bạn cần tuyển đợt này.');
    });

    it('should revert Job from FILLED to OPEN if Employer cancels/rejects previously accepted Student 1', async () => {
      const res = await request(app)
        .patch(`/api/applications/${student1AppId}/status`)
        .set('Cookie', employerCookie)
        .send({
          status: 'REJECTED',
          reason: 'Ứng viên báo bận lịch học không làm được',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(ApplicationStatus.REJECTED);

      // Verify Job is back to OPEN
      const jobCheck = await prisma.job.findUnique({ where: { id: jobId } });
      expect(jobCheck?.status).toBe(JobStatus.OPEN);
    });

    it('should allow Student 3 to apply and then withdraw their application', async () => {
      const applyRes = await request(app)
        .post(`/api/jobs/${jobId}/applications`)
        .set('Cookie', student3Cookie)
        .send({ coverLetter: 'Đơn của bạn số 3' });

      expect(applyRes.status).toBe(201);
      const app3Id = applyRes.body.data.id;

      const withdrawRes = await request(app)
        .patch(`/api/applications/${app3Id}/withdraw`)
        .set('Cookie', student3Cookie)
        .send({ reason: 'Em tìm được việc khác gần nhà hơn' });

      expect(withdrawRes.status).toBe(200);
      expect(withdrawRes.body.data.status).toBe(ApplicationStatus.WITHDRAWN);
    });
  });
});
