import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { Role } from '@prisma/client';
import fs from 'fs';
import path from 'path';

describe('Profile Module & CV Upload', () => {
  const studentEmail = `profile_test_sv_${Date.now()}@example.com`;
  const employerEmail = `profile_test_ntd_${Date.now()}@example.com`;
  const password = 'Password@123';

  let studentCookie: string;
  let employerCookie: string;

  // Temp test files
  const samplePdfPath = path.resolve(__dirname, 'sample_test.pdf');
  const sampleTxtPath = path.resolve(__dirname, 'sample_test.txt');

  beforeAll(async () => {
    // Create dummy PDF (PDF magic number %PDF-)
    fs.writeFileSync(samplePdfPath, '%PDF-1.4 mock pdf content for testing file upload');
    // Create dummy TXT
    fs.writeFileSync(sampleTxtPath, 'mock text content not pdf');

    // 1. Register student
    const resSv = await request(app).post('/api/auth/register').send({
      email: studentEmail,
      password,
      role: Role.STUDENT,
      fullName: 'Sinh Viên Test Profile',
      university: 'Đại học Quốc gia',
      major: 'Công nghệ thông tin',
    });
    studentCookie = resSv.headers['set-cookie'][0];

    // 2. Register employer
    const resNtd = await request(app).post('/api/auth/register').send({
      email: employerEmail,
      password,
      role: Role.EMPLOYER,
      companyName: 'Công ty Test Profile',
      phone: '0988776655',
    });
    employerCookie = resNtd.headers['set-cookie'][0];
  });

  afterAll(async () => {
    // Clean files
    if (fs.existsSync(samplePdfPath)) fs.unlinkSync(samplePdfPath);
    if (fs.existsSync(sampleTxtPath)) fs.unlinkSync(sampleTxtPath);

    // Clean users
    await prisma.studentProfile.deleteMany({ where: { user: { email: studentEmail } } });
    await prisma.employerProfile.deleteMany({ where: { user: { email: employerEmail } } });
    await prisma.user.deleteMany({
      where: { email: { in: [studentEmail, employerEmail] } },
    });
  });

  describe('GET /api/profile/me', () => {
    it('should return student profile data', async () => {
      const res = await request(app)
        .get('/api/profile/me')
        .set('Cookie', studentCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.profile.email).toBe(studentEmail);
      expect(res.body.data.profile.studentProfile.fullName).toBe('Sinh Viên Test Profile');
    });

    it('should return employer profile data', async () => {
      const res = await request(app)
        .get('/api/profile/me')
        .set('Cookie', employerCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.profile.email).toBe(employerEmail);
      expect(res.body.data.profile.employerProfile.companyName).toBe('Công ty Test Profile');
    });
  });

  describe('PUT /api/profile/me', () => {
    it('should update student profile details including skills and bio', async () => {
      const res = await request(app)
        .put('/api/profile/me')
        .set('Cookie', studentCookie)
        .send({
          fullName: 'Nguyễn Văn Sinh Viên Mới',
          university: 'Đại học Bách Khoa',
          major: 'Khoa học Máy tính',
          bio: 'Tôi có kinh nghiệm làm việc bán thời gian và giao tiếp tốt.',
          skills: ['Giao tiếp', 'Tiếng Anh', 'Tin học văn phòng'],
          phone: '0909090909',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.profile.fullName).toBe('Nguyễn Văn Sinh Viên Mới');
      expect(res.body.data.profile.skills).toEqual(['Giao tiếp', 'Tiếng Anh', 'Tin học văn phòng']);
      expect(res.body.data.profile.phone).toBe('0909090909');
    });

    it('should update employer profile details', async () => {
      const res = await request(app)
        .put('/api/profile/me')
        .set('Cookie', employerCookie)
        .send({
          companyName: 'Công ty Cổ phần Công nghệ ABC',
          description: 'Doanh nghiệp phát triển phần mềm và dịch vụ trực tuyến.',
          address: '456 Lê Duẩn, Quận 1, TP.HCM',
          phone: '0281234567',
          website: 'https://abctech.vn',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.profile.companyName).toBe('Công ty Cổ phần Công nghệ ABC');
      expect(res.body.data.profile.website).toBe('https://abctech.vn');
    });
  });

  describe('POST /api/profile/cv (Multer PDF Upload)', () => {
    it('should successfully upload a valid PDF CV and update cvUrl', async () => {
      const res = await request(app)
        .post('/api/profile/cv')
        .set('Cookie', studentCookie)
        .attach('cv', samplePdfPath);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('cvUrl');
      expect(res.body.data.cvUrl).toMatch(/^\/uploads\/cv-.*\.pdf$/);
    });

    it('should reject non-PDF file upload with 400 INVALID_FILE_TYPE', async () => {
      const res = await request(app)
        .post('/api/profile/cv')
        .set('Cookie', studentCookie)
        .attach('cv', sampleTxtPath);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_FILE_TYPE');
    });

    it('should reject employer from uploading CV (403 FORBIDDEN)', async () => {
      const res = await request(app)
        .post('/api/profile/cv')
        .set('Cookie', employerCookie)
        .attach('cv', samplePdfPath);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });
});
