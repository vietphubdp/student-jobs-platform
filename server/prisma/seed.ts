import { PrismaClient, Role, UserStatus, SalaryUnit, JobStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clean existing data in reverse order of relationships
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.category.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.employerProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHashAdmin = await bcrypt.hash('Admin@123456', 10);
  const passwordHashEmployer = await bcrypt.hash('Employer@123456', 10);
  const passwordHashStudent = await bcrypt.hash('Student@123456', 10);

  // 2. Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@studentjobs.vn',
      passwordHash: passwordHashAdmin,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`✅ Created Admin user: ${admin.email}`);

  // 3. Create Categories
  const categoriesData = [
    { name: 'Phục vụ / Pha chế (F&B)' },
    { name: 'Gia sư / Dạy kèm' },
    { name: 'Bán hàng / Thu ngân' },
    { name: 'Lễ tân / Sự kiện (PG, PB)' },
    { name: 'Giao hàng / Shipper' },
    { name: 'Thiết kế / Sáng tạo nội dung' },
    { name: 'IT / Nhập liệu văn phòng' },
    { name: 'Chăm sóc khách hàng (Telesale/Call Center)' },
  ];

  const categories = await Promise.all(
    categoriesData.map((c) =>
      prisma.category.create({
        data: c,
      })
    )
  );
  console.log(`✅ Created ${categories.length} job categories`);

  // 4. Create Demo Employer
  const employer = await prisma.user.create({
    data: {
      email: 'employer@demo.com',
      passwordHash: passwordHashEmployer,
      role: Role.EMPLOYER,
      status: UserStatus.ACTIVE,
      employerProfile: {
        create: {
          companyName: 'The Coffee House & Tea Lounge',
          description: 'Chuỗi cửa hàng đồ uống phong cách hiện đại dành cho giới trẻ và sinh viên.',
          address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
          phone: '0901234567',
          website: 'https://demo-coffee.vn',
          isVerified: true,
        },
      },
    },
    include: {
      employerProfile: true,
    },
  });
  console.log(`✅ Created Employer: ${employer.email}`);

  // 5. Create Demo Student
  const student = await prisma.user.create({
    data: {
      email: 'student@demo.com',
      passwordHash: passwordHashStudent,
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
      studentProfile: {
        create: {
          fullName: 'Nguyễn Văn Sinh Viên',
          phone: '0987654321',
          university: 'Đại học Quốc gia TP.HCM',
          major: 'Công nghệ thông tin',
          bio: 'Sinh viên năm 3 năng động, có kỹ năng giao tiếp tốt và mong muốn tìm việc làm thêm linh hoạt.',
          skills: ['Giao tiếp', 'Pha chế cơ bản', 'Tiếng Anh giao tiếp', 'Tin học văn phòng'],
        },
      },
    },
    include: {
      studentProfile: true,
    },
  });
  console.log(`✅ Created Student: ${student.email}`);

  // 6. Create Demo Jobs
  const fbCategory = categories.find((c) => c.name.includes('Phục vụ')) || categories[0];
  const tutorCategory = categories.find((c) => c.name.includes('Gia sư')) || categories[1];
  const itCategory = categories.find((c) => c.name.includes('IT')) || categories[6];

  const deadlineFuture = new Date();
  deadlineFuture.setDate(deadlineFuture.getDate() + 30);

  const job1 = await prisma.job.create({
    data: {
      employerId: employer.id,
      categoryId: fbCategory.id,
      title: 'Nhân viên Phục vụ / Pha chế ca xoay linh hoạt',
      description: 'Cần tuyển 3 bạn sinh viên phụ trách oder, phục vụ bàn và hỗ trợ pha chế thức uống theo ca 4h/ngày.',
      workTime: 'Ca sáng (7h30-11h30) hoặc Ca tối (18h-22h)',
      salaryMin: 28000,
      salaryMax: 35000,
      salaryUnit: SalaryUnit.HOUR,
      location: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1',
      city: 'TP. Hồ Chí Minh',
      slots: 3,
      deadline: deadlineFuture,
      status: JobStatus.OPEN,
    },
  });

  const job2 = await prisma.job.create({
    data: {
      employerId: employer.id,
      categoryId: tutorCategory.id,
      title: 'Gia sư Tiếng Anh cấp 2 (Lớp 7 - 8)',
      description: 'Dạy kèm 1 học sinh lớp 8 ôn luyện ngữ pháp và phát âm. Yêu cầu phát âm chuẩn, nhiệt tình.',
      workTime: '3 buổi/tuần (18h30 - 20h30 Thứ 2, 4, 6)',
      salaryMin: 180000,
      salaryMax: 220000,
      salaryUnit: SalaryUnit.DAY,
      location: 'Quận Cầu Giấy',
      city: 'Hà Nội',
      slots: 1,
      deadline: deadlineFuture,
      status: JobStatus.OPEN,
    },
  });

  const job3 = await prisma.job.create({
    data: {
      employerId: employer.id,
      categoryId: itCategory.id,
      title: 'Cộng tác viên Nhập liệu Website Part-time',
      description: 'Nhập thông tin sản phẩm lên hệ thống bán hàng, kiểm tra hình ảnh và mô tả sản phẩm.',
      workTime: 'Làm việc linh hoạt tại nhà (Online 15h/tuần)',
      salaryMin: 2500000,
      salaryMax: 3500000,
      salaryUnit: SalaryUnit.MONTH,
      location: 'Làm việc Online / Từ xa',
      city: 'Toàn quốc',
      slots: 2,
      deadline: deadlineFuture,
      status: JobStatus.OPEN,
    },
  });

  console.log(`✅ Created demo jobs: [${job1.title}, ${job2.title}, ${job3.title}]`);
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error while seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
