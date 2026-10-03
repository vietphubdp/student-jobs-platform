import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { Role, ApplicationStatus, JobStatus, SalaryUnit } from '@prisma/client';

describe('Review Module & Two-way Rating (BR4, BR5, BR6)', () => {
  const timestamp = Date.now();
  const employerEmail = `review_emp_${timestamp}@test.com`;
  const studentEmail = `review_stu_${timestamp}@test.com`;
  const otherStudentEmail = `review_other_stu_${timestamp}@test.com`;
  const password = 'Password@123';

  let employerId: string;
  let studentId: string;
  let otherStudentId: string;

  let employerCookie: string;
  let studentCookie: string;
  let otherStudentCookie: string;

  let categoryId: string;
  let jobId: string;
  let applicationId: string;

  beforeAll(async () => {
    // 1. Get or create category
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({ data: { name: `Ngành nghề Test ${timestamp}` } });
    }
    categoryId = category.id;

    // 2. Register Employer
    const resEmp = await request(app).post('/api/auth/register').send({
      email: employerEmail,
      password,
      role: Role.EMPLOYER,
      companyName: 'Công ty Cổ phần Đánh giá Test',
      phone: '0988776655',
    });
    employerCookie = resEmp.headers['set-cookie'][0];
    employerId = resEmp.body.data.user.id;

    // 3. Register Student 1
    const resStu = await request(app).post('/api/auth/register').send({
      email: studentEmail,
      password,
      role: Role.STUDENT,
      fullName: 'Nguyễn Văn Đánh Giá',
      phone: '0911223344',
    });
    studentCookie = resStu.headers['set-cookie'][0];
    studentId = resStu.body.data.user.id;

    // 4. Register Student 2 (for negative tests)
    const resOtherStu = await request(app).post('/api/auth/register').send({
      email: otherStudentEmail,
      password,
      role: Role.STUDENT,
      fullName: 'Trần Thị Người Ngoài',
      phone: '0933445566',
    });
    otherStudentCookie = resOtherStu.headers['set-cookie'][0];
    otherStudentId = resOtherStu.body.data.user.id;

    // 5. Employer creates Job
    const deadline = new Date(Date.now() + 86400000 * 7).toISOString();
    const resJob = await request(app)
      .post('/api/jobs')
      .set('Cookie', employerCookie)
      .send({
        title: 'Nhân viên Phục vụ Part-time Review Test',
        description: 'Công việc phục vụ đồ uống và hỗ trợ khách hàng',
        categoryId,
        workTime: 'Ca tối 18h-22h',
        salaryMin: 35000,
        salaryMax: 45000,
        salaryUnit: SalaryUnit.HOUR,
        location: '123 Đường Test, Quận 1',
        city: 'Hồ Chí Minh',
        slots: 2,
        deadline,
        status: JobStatus.OPEN,
      });
    jobId = resJob.body.data.job.id;

    // 6. Student 1 applies for Job
    const resApp = await request(app)
      .post(`/api/jobs/${jobId}/applications`)
      .set('Cookie', studentCookie)
      .send({
        coverLetter: 'Tôi có kinh nghiệm phục vụ và rất mong được làm việc',
      });
    applicationId = resApp.body.data.id;
  });

  describe('BR4 Validation: Job status must be COMPLETED & Application status must be ACCEPTED', () => {
    it('should reject review when job is still OPEN and app is PENDING (400)', async () => {
      const res = await request(app)
        .post(`/api/applications/${applicationId}/reviews`)
        .set('Cookie', studentCookie)
        .send({
          rating: 5,
          comment: 'Nhà tuyển dụng rất tốt!',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('JOB_NOT_COMPLETED');
    });

    it('should reject review when job is COMPLETED but application was not ACCEPTED (e.g. REJECTED)', async () => {
      // Create another application that will be rejected
      const resOtherApp = await request(app)
        .post(`/api/jobs/${jobId}/applications`)
        .set('Cookie', otherStudentCookie)
        .send({
          coverLetter: 'Xin việc phụ',
        });
      const otherAppId = resOtherApp.body.data.id;

      // Employer rejects other app
      await request(app)
        .patch(`/api/applications/${otherAppId}/status`)
        .set('Cookie', employerCookie)
        .send({ status: 'REJECTED', reason: 'Không phù hợp' });

      // Employer accepts student 1
      await request(app)
        .patch(`/api/applications/${applicationId}/status`)
        .set('Cookie', employerCookie)
        .send({ status: 'ACCEPTED' });

      // Employer marks job as COMPLETED
      await request(app)
        .patch(`/api/jobs/${jobId}/status`)
        .set('Cookie', employerCookie)
        .send({ status: 'COMPLETED' });

      // Student 2 tries to review on rejected app
      const res = await request(app)
        .post(`/api/applications/${otherAppId}/reviews`)
        .set('Cookie', otherStudentCookie)
        .send({
          rating: 1,
          comment: 'Bị từ chối nên đánh giá 1 sao',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('APPLICATION_NOT_ACCEPTED');
    });
  });

  describe('BR5 Validation: 1 review per party, rating 1-5, optional comment', () => {
    it('should reject review if non-participant tries to review (403)', async () => {
      const res = await request(app)
        .post(`/api/applications/${applicationId}/reviews`)
        .set('Cookie', otherStudentCookie)
        .send({
          rating: 5,
          comment: 'Đánh giá giùm bạn',
        });

      expect(res.status).toBe(403);
    });

    it('should reject invalid ratings (< 1 or > 5 or non-integer)', async () => {
      const res1 = await request(app)
        .post(`/api/applications/${applicationId}/reviews`)
        .set('Cookie', studentCookie)
        .send({ rating: 0, comment: 'Quá tệ' });
      expect(res1.status).toBe(400);

      const res2 = await request(app)
        .post(`/api/applications/${applicationId}/reviews`)
        .set('Cookie', studentCookie)
        .send({ rating: 6, comment: 'Quá tuyệt' });
      expect(res2.status).toBe(400);

      const res3 = await request(app)
        .post(`/api/applications/${applicationId}/reviews`)
        .set('Cookie', studentCookie)
        .send({ rating: 4.5 });
      expect(res3.status).toBe(400);
    });

    it('should allow Student to submit a valid review for Employer (201)', async () => {
      const res = await request(app)
        .post(`/api/applications/${applicationId}/reviews`)
        .set('Cookie', studentCookie)
        .send({
          rating: 5,
          comment: 'Nhà tuyển dụng cực kỳ nhiệt tình, thanh toán đúng giờ, môi trường thân thiện!',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.rating).toBe(5);
      expect(res.body.data.reviewerId).toBe(studentId);
      expect(res.body.data.revieweeId).toBe(employerId);
      expect(res.body.data.comment).toContain('thanh toán đúng giờ');
    });

    it('should reject duplicate review by Student for the same application (400 REVIEW_ALREADY_EXISTS)', async () => {
      const res = await request(app)
        .post(`/api/applications/${applicationId}/reviews`)
        .set('Cookie', studentCookie)
        .send({
          rating: 4,
          comment: 'Đánh giá lần 2',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('REVIEW_ALREADY_EXISTS');
    });

    it('should allow Employer to submit a valid review for Student (201)', async () => {
      const res = await request(app)
        .post(`/api/applications/${applicationId}/reviews`)
        .set('Cookie', employerCookie)
        .send({
          rating: 4,
          comment: 'Bạn sinh viên chăm chỉ, đúng giờ, giao tiếp tốt!',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.rating).toBe(4);
      expect(res.body.data.reviewerId).toBe(employerId);
      expect(res.body.data.revieweeId).toBe(studentId);
    });

    it('should reject duplicate review by Employer for the same application (400 REVIEW_ALREADY_EXISTS)', async () => {
      const res = await request(app)
        .post(`/api/applications/${applicationId}/reviews`)
        .set('Cookie', employerCookie)
        .send({
          rating: 5,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('REVIEW_ALREADY_EXISTS');
    });
  });

  describe('User Reviews Query & Statistics (GET /api/users/:id/reviews)', () => {
    it('should return employer profile, summary with average rating = 5.0 and review list', async () => {
      const res = await request(app).get(`/api/users/${employerId}/reviews`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.id).toBe(employerId);
      expect(res.body.data.summary.averageRating).toBe(5);
      expect(res.body.data.summary.totalReviews).toBe(1);
      expect(res.body.data.summary.distribution[5]).toBe(1);
      expect(res.body.data.reviews.length).toBe(1);
      expect(res.body.data.reviews[0].reviewer.studentProfile.fullName).toBe('Nguyễn Văn Đánh Giá');
    });

    it('should return student profile, summary with average rating = 4.0 and review list', async () => {
      const res = await request(app).get(`/api/users/${studentId}/reviews`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.id).toBe(studentId);
      expect(res.body.data.summary.averageRating).toBe(4);
      expect(res.body.data.summary.totalReviews).toBe(1);
      expect(res.body.data.summary.distribution[4]).toBe(1);
      expect(res.body.data.reviews.length).toBe(1);
      expect(res.body.data.reviews[0].reviewer.employerProfile.companyName).toBe('Công ty Cổ phần Đánh giá Test');
    });

    it('should return 404 for non-existent user id', async () => {
      const res = await request(app).get('/api/users/00000000-0000-0000-0000-000000000000/reviews');
      expect(res.status).toBe(404);
    });
  });

  describe('Application Review Status (GET /api/applications/:id/reviews)', () => {
    it('should return myReview, counterpartReview and canReview = false when both reviewed', async () => {
      const res = await request(app)
        .get(`/api/applications/${applicationId}/reviews`)
        .set('Cookie', studentCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.canReview).toBe(false);
      expect(res.body.data.myReview.rating).toBe(5);
      expect(res.body.data.counterpartReview.rating).toBe(4);
    });
  });
});
