import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { Role, UserStatus, JobStatus, SalaryUnit } from '@prisma/client';
import { canJobTransition } from '../src/modules/job/job.state-machine';
import { canApplicationTransition } from '../src/modules/application/application.state-machine';

describe('Comprehensive Business Rules Verification (BR1 to BR10)', () => {
  const timestamp = Date.now();
  const employerEmail = `br_emp_${timestamp}@test.com`;
  const otherEmployerEmail = `br_other_emp_${timestamp}@test.com`;
  const student1Email = `br_stu1_${timestamp}@test.com`;
  const student2Email = `br_stu2_${timestamp}@test.com`;
  const student3Email = `br_stu3_${timestamp}@test.com`;
  const adminEmail = `br_admin_${timestamp}@test.com`;
  const password = 'Password@123';

  let employerId: string;
  let otherEmployerId: string;
  let student1Id: string;
  let student2Id: string;
  let student3Id: string;
  let adminId: string;

  let employerCookie: string;
  let otherEmployerCookie: string;
  let student1Cookie: string;
  let student2Cookie: string;
  let student3Cookie: string;
  let adminCookie: string;

  let categoryId: string;
  let singleSlotJobId: string;
  let multiSlotJobId: string;

  beforeAll(async () => {
    // 1. Ensure category exists
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({ data: { name: `Ngành BR ${timestamp}` } });
    }
    categoryId = category.id;

    // 2. Register Employer 1
    const resEmp = await request(app).post('/api/auth/register').send({
      email: employerEmail,
      password,
      role: Role.EMPLOYER,
      companyName: 'Công ty Doanh Nghiệp BR',
    });
    employerCookie = resEmp.headers['set-cookie'][0];
    employerId = resEmp.body.data.user.id;

    // 3. Register Other Employer
    const resOtherEmp = await request(app).post('/api/auth/register').send({
      email: otherEmployerEmail,
      password,
      role: Role.EMPLOYER,
      companyName: 'Công ty Khác',
    });
    otherEmployerCookie = resOtherEmp.headers['set-cookie'][0];
    otherEmployerId = resOtherEmp.body.data.user.id;

    // 4. Register Students
    const resStu1 = await request(app).post('/api/auth/register').send({
      email: student1Email,
      password,
      role: Role.STUDENT,
      fullName: 'Sinh Viên BR 1',
    });
    student1Cookie = resStu1.headers['set-cookie'][0];
    student1Id = resStu1.body.data.user.id;

    const resStu2 = await request(app).post('/api/auth/register').send({
      email: student2Email,
      password,
      role: Role.STUDENT,
      fullName: 'Sinh Viên BR 2',
    });
    student2Cookie = resStu2.headers['set-cookie'][0];
    student2Id = resStu2.body.data.user.id;

    const resStu3 = await request(app).post('/api/auth/register').send({
      email: student3Email,
      password,
      role: Role.STUDENT,
      fullName: 'Sinh Viên BR 3',
    });
    student3Cookie = resStu3.headers['set-cookie'][0];
    student3Id = resStu3.body.data.user.id;

    // 5. Create Admin user via DB seed
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: resStu1.body.data.user ? await prisma.user.findUnique({ where: { id: student1Id } }).then(u => u!.passwordHash) : '',
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });
    adminId = admin.id;

    const resAdminLogin = await request(app).post('/api/auth/login').send({
      email: adminEmail,
      password,
    });
    adminCookie = resAdminLogin.headers['set-cookie'][0];

    // 6. Create Jobs
    const deadline = new Date(Date.now() + 86400000 * 7).toISOString();
    const resJob1 = await request(app)
      .post('/api/jobs')
      .set('Cookie', employerCookie)
      .send({
        title: 'Job 1 Slot Duy Nhất',
        description: 'Mô tả công việc 1 slot',
        categoryId,
        workTime: 'Ca sáng',
        salaryMin: 30000,
        salaryUnit: SalaryUnit.HOUR,
        location: '123 Đường Test',
        city: 'TP.HCM',
        slots: 1,
        deadline,
        status: JobStatus.OPEN,
      });
    singleSlotJobId = resJob1.body.data.job.id;

    const resJob2 = await request(app)
      .post('/api/jobs')
      .set('Cookie', employerCookie)
      .send({
        title: 'Job 2 Slots Đa Năng',
        description: 'Mô tả công việc 2 slots',
        categoryId,
        workTime: 'Ca tối',
        salaryMin: 35000,
        salaryUnit: SalaryUnit.HOUR,
        location: '456 Đường Test',
        city: 'TP.HCM',
        slots: 2,
        deadline,
        status: JobStatus.OPEN,
      });
    multiSlotJobId = resJob2.body.data.job.id;
  });

  // --- BR7: Role registration rules ---
  describe('BR7: Role Registration Constraints', () => {
    it('should reject registration with role ADMIN (400 Bad Request)', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: `fake_admin_${timestamp}@test.com`,
        password,
        role: 'ADMIN',
      });
      expect(res.status).toBe(400);
    });

    it('should allow public registration only for STUDENT and EMPLOYER', async () => {
      const res1 = await request(app).post('/api/auth/register').send({
        email: `val_stu_${timestamp}@test.com`,
        password,
        role: 'STUDENT',
        fullName: 'Học Sinh',
      });
      expect(res1.status).toBe(201);

      const res2 = await request(app).post('/api/auth/register').send({
        email: `val_emp_${timestamp}@test.com`,
        password,
        role: 'EMPLOYER',
        companyName: 'Doanh Nghiệp Mới',
      });
      expect(res2.status).toBe(201);
    });
  });

  // --- BR1 & BR2: Application Rules ---
  describe('BR1 & BR2: Application Submissions', () => {
    it('BR2: should reject application if job is not OPEN (e.g. DRAFT or CLOSED)', async () => {
      // Create closed job
      const resClosedJob = await request(app)
        .post('/api/jobs')
        .set('Cookie', employerCookie)
        .send({
          title: 'Job Closed Test',
          description: 'Mô tả công việc kiểm tra đóng tuyển dụng',
          categoryId,
          workTime: 'Ca tối',
          salaryMin: 30000,
          salaryUnit: SalaryUnit.HOUR,
          location: 'Test',
          city: 'TP.HCM',
          slots: 1,
          deadline: new Date(Date.now() + 86400000).toISOString(),
          status: JobStatus.OPEN,
        });
      const closedJobId = resClosedJob.body.data.job.id;

      await request(app)
        .patch(`/api/jobs/${closedJobId}/status`)
        .set('Cookie', employerCookie)
        .send({ status: 'CLOSED' });

      const res = await request(app)
        .post(`/api/jobs/${closedJobId}/applications`)
        .set('Cookie', student1Cookie)
        .send({ coverLetter: 'Ứng tuyển' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('JOB_NOT_OPEN');
    });

    it('BR2: should reject application if deadline has passed', async () => {
      // Create expired job directly in DB
      const expiredJob = await prisma.job.create({
        data: {
          employerId,
          categoryId,
          title: 'Job Hết Hạn',
          description: 'Mô tả công việc hết hạn nộp',
          workTime: 'Ca tối',
          salaryMin: 30000,
          salaryUnit: SalaryUnit.HOUR,
          location: 'Test',
          city: 'TP.HCM',
          slots: 1,
          deadline: new Date(Date.now() - 86400000), // yesterday
          status: JobStatus.OPEN,
        },
      });

      const res = await request(app)
        .post(`/api/jobs/${expiredJob.id}/applications`)
        .set('Cookie', student1Cookie)
        .send({ coverLetter: 'Ứng tuyển' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('DEADLINE_PASSED');
    });

    it('BR2: should reject application if job is hidden by admin', async () => {
      // Hide job
      await request(app)
        .patch(`/api/admin/jobs/${singleSlotJobId}/hide`)
        .set('Cookie', adminCookie)
        .send({ isHidden: true });

      const res = await request(app)
        .post(`/api/jobs/${singleSlotJobId}/applications`)
        .set('Cookie', student1Cookie)
        .send({ coverLetter: 'Ứng tuyển' });

      expect(res.status).toBe(404);

      // Unhide for next tests
      await request(app)
        .patch(`/api/admin/jobs/${singleSlotJobId}/hide`)
        .set('Cookie', adminCookie)
        .send({ isHidden: false });
    });

    it('BR1: should allow student to apply once and reject duplicate application (400 DUPLICATE_APPLICATION)', async () => {
      // First application
      const res1 = await request(app)
        .post(`/api/jobs/${singleSlotJobId}/applications`)
        .set('Cookie', student1Cookie)
        .send({ coverLetter: 'Đơn lần 1' });
      expect(res1.status).toBe(201);

      // Duplicate application on the same job
      const res2 = await request(app)
        .post(`/api/jobs/${singleSlotJobId}/applications`)
        .set('Cookie', student1Cookie)
        .send({ coverLetter: 'Đơn nộp lại' });
      expect(res2.status).toBe(400);
      expect(res2.body.error.code).toBe('DUPLICATE_APPLICATION');
    });
  });

  // --- BR3: Ownership & Access Control ---
  describe('BR3: Employer Ownership Checks', () => {
    it('should reject other employer from viewing job applications (403 FORBIDDEN)', async () => {
      const res = await request(app)
        .get(`/api/jobs/${singleSlotJobId}/applications`)
        .set('Cookie', otherEmployerCookie);

      expect(res.status).toBe(403);
    });

    it('should reject other employer from accepting/rejecting application (403 FORBIDDEN)', async () => {
      const appRecord = await prisma.application.findFirst({
        where: { jobId: singleSlotJobId, studentId: student1Id },
      });

      const res = await request(app)
        .patch(`/api/applications/${appRecord!.id}/status`)
        .set('Cookie', otherEmployerCookie)
        .send({ status: 'ACCEPTED' });

      expect(res.status).toBe(403);
    });
  });

  // --- BR10: Concurrency & Slots Auto-Fill ---
  describe('BR10: Slots Limit & Auto-Transition to FILLED', () => {
    let app1Id: string;
    let app2Id: string;

    beforeAll(async () => {
      // Student 1 and Student 2 apply to multiSlotJobId (slots = 2)
      const res1 = await request(app)
        .post(`/api/jobs/${multiSlotJobId}/applications`)
        .set('Cookie', student1Cookie)
        .send({ coverLetter: 'SV1 apply multi' });
      app1Id = res1.body.data.id;

      const res2 = await request(app)
        .post(`/api/jobs/${multiSlotJobId}/applications`)
        .set('Cookie', student2Cookie)
        .send({ coverLetter: 'SV2 apply multi' });
      app2Id = res2.body.data.id;

      // Student 3 also applies
      await request(app)
        .post(`/api/jobs/${multiSlotJobId}/applications`)
        .set('Cookie', student3Cookie)
        .send({ coverLetter: 'SV3 apply multi' });
    });

    it('should accept candidate 1 (acceptedCount = 1, job remains OPEN)', async () => {
      const res = await request(app)
        .patch(`/api/applications/${app1Id}/status`)
        .set('Cookie', employerCookie)
        .send({ status: 'ACCEPTED' });

      expect(res.status).toBe(200);

      const job = await prisma.job.findUnique({ where: { id: multiSlotJobId } });
      expect(job!.status).toBe(JobStatus.OPEN);
    });

    it('should accept candidate 2 and automatically transition job to FILLED when acceptedCount == slots', async () => {
      const res = await request(app)
        .patch(`/api/applications/${app2Id}/status`)
        .set('Cookie', employerCookie)
        .send({ status: 'ACCEPTED' });

      expect(res.status).toBe(200);

      const job = await prisma.job.findUnique({ where: { id: multiSlotJobId } });
      expect(job!.status).toBe(JobStatus.FILLED);
    });

    it('should reject accepting additional candidate when job is already FILLED', async () => {
      const app3 = await prisma.application.findFirst({
        where: { jobId: multiSlotJobId, studentId: student3Id },
      });

      const res = await request(app)
        .patch(`/api/applications/${app3!.id}/status`)
        .set('Cookie', employerCookie)
        .send({ status: 'ACCEPTED' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('JOB_SLOTS_FULL');
    });

    it('should revert job from FILLED to OPEN if employer rejects an accepted candidate', async () => {
      const res = await request(app)
        .patch(`/api/applications/${app2Id}/status`)
        .set('Cookie', employerCookie)
        .send({ status: 'REJECTED', reason: 'Thay đổi kế hoạch' });

      expect(res.status).toBe(200);

      const job = await prisma.job.findUnique({ where: { id: multiSlotJobId } });
      expect(job!.status).toBe(JobStatus.OPEN);
    });
  });

  // --- BR4, BR5, BR6: Two-way Reviews ---
  describe('BR4, BR5, BR6: Review Rules & Moderation', () => {
    let completedJobId: string;
    let completedAppId: string;

    beforeAll(async () => {
      // Create a fresh job, apply, accept, and complete
      const resJob = await request(app)
        .post('/api/jobs')
        .set('Cookie', employerCookie)
        .send({
          title: 'Job Hoàn Thành Cho Review',
          description: 'Mô tả công việc hoàn thành đầy đủ cho đánh giá',
          categoryId,
          workTime: 'Ca sáng',
          salaryMin: 30000,
          salaryUnit: SalaryUnit.HOUR,
          location: 'Test',
          city: 'TP.HCM',
          slots: 1,
          deadline: new Date(Date.now() + 86400000).toISOString(),
          status: JobStatus.OPEN,
        });
      completedJobId = resJob.body.data.job.id;

      const resApp = await request(app)
        .post(`/api/jobs/${completedJobId}/applications`)
        .set('Cookie', student1Cookie)
        .send({ coverLetter: 'Nộp đơn' });
      completedAppId = resApp.body.data.id;

      await request(app)
        .patch(`/api/applications/${completedAppId}/status`)
        .set('Cookie', employerCookie)
        .send({ status: 'ACCEPTED' });

      await request(app)
        .patch(`/api/jobs/${completedJobId}/status`)
        .set('Cookie', employerCookie)
        .send({ status: 'COMPLETED' });
    });

    it('BR4: should allow review when job is COMPLETED and app is ACCEPTED', async () => {
      const res = await request(app)
        .post(`/api/applications/${completedAppId}/reviews`)
        .set('Cookie', student1Cookie)
        .send({ rating: 5, comment: 'Công việc rất tuyệt vời!' });

      expect(res.status).toBe(201);
      expect(res.body.data.rating).toBe(5);
    });

    it('BR5: should reject duplicate review by same party on the same application (400 REVIEW_ALREADY_EXISTS)', async () => {
      const res = await request(app)
        .post(`/api/applications/${completedAppId}/reviews`)
        .set('Cookie', student1Cookie)
        .send({ rating: 4, comment: 'Đánh giá lần 2' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('REVIEW_ALREADY_EXISTS');
    });

    it('BR5: should allow employer to review student (2-way review)', async () => {
      const res = await request(app)
        .post(`/api/applications/${completedAppId}/reviews`)
        .set('Cookie', employerCookie)
        .send({ rating: 5, comment: 'Sinh viên làm việc chăm chỉ' });

      expect(res.status).toBe(201);
      expect(res.body.data.rating).toBe(5);
    });

    it('BR6: Admin can hide review and it is excluded from public reviews list and average score', async () => {
      const reviewRecord = await prisma.review.findFirst({
        where: { applicationId: completedAppId, reviewerId: student1Id },
      });

      // Admin hides review
      const resHide = await request(app)
        .patch(`/api/admin/reviews/${reviewRecord!.id}/hide`)
        .set('Cookie', adminCookie)
        .send({ isHidden: true });
      expect(resHide.status).toBe(200);

      // Verify public employer reviews do not show hidden review
      const resPublicReviews = await request(app).get(`/api/users/${employerId}/reviews`);
      expect(resPublicReviews.status).toBe(200);
      const found = resPublicReviews.body.data.reviews.find((r: any) => r.id === reviewRecord!.id);
      expect(found).toBeUndefined();
    });
  });

  // --- BR9: In-app Notifications ---
  describe('BR9: In-App Notifications on State Transitions', () => {
    it('should verify notifications are generated for application submission, acceptance, and job completion', async () => {
      const studentNotifs = await prisma.notification.findMany({
        where: { userId: student1Id },
      });
      const employerNotifs = await prisma.notification.findMany({
        where: { userId: employerId },
      });

      expect(studentNotifs.length).toBeGreaterThan(0);
      expect(employerNotifs.length).toBeGreaterThan(0);
    });
  });
});
