import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { Role, JobStatus, SalaryUnit } from '@prisma/client';

describe('Notification Module & BR9 In-App Alerts', () => {
  const timestamp = Date.now();
  const employerEmail = `notif_emp_${timestamp}@test.com`;
  const studentEmail = `notif_stu_${timestamp}@test.com`;
  const otherStudentEmail = `notif_other_stu_${timestamp}@test.com`;
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
  let createdNotificationId: string;

  beforeAll(async () => {
    // 1. Category
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({ data: { name: `Ngành nghề Notif ${timestamp}` } });
    }
    categoryId = category.id;

    // 2. Register Employer
    const resEmp = await request(app).post('/api/auth/register').send({
      email: employerEmail,
      password,
      role: Role.EMPLOYER,
      companyName: 'Công ty Cổ phần Thông Báo Test',
      phone: '0988112233',
    });
    employerCookie = resEmp.headers['set-cookie'][0];
    employerId = resEmp.body.data.user.id;

    // 3. Register Student
    const resStu = await request(app).post('/api/auth/register').send({
      email: studentEmail,
      password,
      role: Role.STUDENT,
      fullName: 'Nguyễn Văn Thông Báo',
      phone: '0911223344',
    });
    studentCookie = resStu.headers['set-cookie'][0];
    studentId = resStu.body.data.user.id;

    // 4. Register Other Student
    const resOtherStu = await request(app).post('/api/auth/register').send({
      email: otherStudentEmail,
      password,
      role: Role.STUDENT,
      fullName: 'Trần Thị Người Khác',
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
        title: 'Nhân viên Phụ bếp Notif Test',
        description: 'Hỗ trợ chuẩn bị nguyên liệu',
        categoryId,
        workTime: 'Ca sáng',
        salaryMin: 30000,
        salaryMax: 40000,
        salaryUnit: SalaryUnit.HOUR,
        location: '456 Đường Test, Quận 3',
        city: 'Hồ Chí Minh',
        slots: 1,
        deadline,
        status: JobStatus.OPEN,
      });
    jobId = resJob.body.data.job.id;
  });

  describe('BR9 Automatic Notification Triggers', () => {
    it('should generate NEW_APPLICATION notification for employer when student applies', async () => {
      const resApp = await request(app)
        .post(`/api/jobs/${jobId}/applications`)
        .set('Cookie', studentCookie)
        .send({
          coverLetter: 'Em muốn ứng tuyển vị trí này ạ',
        });
      expect(resApp.status).toBe(201);
      applicationId = resApp.body.data.id;

      // Check employer's notifications
      const resNotif = await request(app)
        .get('/api/notifications')
        .set('Cookie', employerCookie);

      expect(resNotif.status).toBe(200);
      expect(resNotif.body.data.unreadCount).toBeGreaterThanOrEqual(1);
      const notif = resNotif.body.data.notifications.find(
        (n: any) => n.type === 'APPLICATION_RECEIVED'
      );
      expect(notif).toBeDefined();
      expect(notif.isRead).toBe(false);
      expect(notif.content).toContain('Nguyễn Văn Thông Báo');
      createdNotificationId = notif.id;
    });

    it('should generate APPLICATION_ACCEPTED notification for student when employer accepts', async () => {
      const resAccept = await request(app)
        .patch(`/api/applications/${applicationId}/status`)
        .set('Cookie', employerCookie)
        .send({ status: 'ACCEPTED' });
      expect(resAccept.status).toBe(200);

      // Check student's notifications
      const resNotif = await request(app)
        .get('/api/notifications')
        .set('Cookie', studentCookie);

      expect(resNotif.status).toBe(200);
      const notif = resNotif.body.data.notifications.find(
        (n: any) => n.type === 'APPLICATION_ACCEPTED'
      );
      expect(notif).toBeDefined();
      expect(notif.title.toLowerCase()).toContain('chấp nhận');
    });

    it('should generate JOB_COMPLETED notification for accepted student when employer marks job COMPLETED', async () => {
      const resComplete = await request(app)
        .patch(`/api/jobs/${jobId}/status`)
        .set('Cookie', employerCookie)
        .send({ status: 'COMPLETED' });
      expect(resComplete.status).toBe(200);

      const resNotif = await request(app)
        .get('/api/notifications')
        .set('Cookie', studentCookie);

      expect(resNotif.status).toBe(200);
      const notif = resNotif.body.data.notifications.find(
        (n: any) => n.type === 'JOB_COMPLETED'
      );
      expect(notif).toBeDefined();
    });
  });

  describe('Notification Management & Read Status APIs', () => {
    it('should reject unauthenticated request to /api/notifications (401)', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.status).toBe(401);
    });

    it('should return unread count via /api/notifications/unread-count', async () => {
      const res = await request(app)
        .get('/api/notifications/unread-count')
        .set('Cookie', employerCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.unreadCount).toBeGreaterThanOrEqual(1);
    });

    it('should reject marking another user notification as read (403)', async () => {
      const res = await request(app)
        .patch(`/api/notifications/${createdNotificationId}/read`)
        .set('Cookie', otherStudentCookie);

      expect(res.status).toBe(403);
    });

    it('should mark a single notification as read (200)', async () => {
      const res = await request(app)
        .patch(`/api/notifications/${createdNotificationId}/read`)
        .set('Cookie', employerCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.isRead).toBe(true);
    });

    it('should mark all notifications as read via /api/notifications/read-all', async () => {
      const res = await request(app)
        .patch('/api/notifications/read-all')
        .set('Cookie', studentCookie);

      expect(res.status).toBe(200);

      // Verify unread count is now 0
      const resCount = await request(app)
        .get('/api/notifications/unread-count')
        .set('Cookie', studentCookie);

      expect(resCount.body.data.unreadCount).toBe(0);
    });
  });
});
