# 🎓 StudentJobs - Nền Tảng Kết Nối Việc Làm Part-time Cho Sinh Viên

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js_20-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Vitest](https://img.shields.io/badge/Tests-93%20Passed-brightgreen?style=for-the-badge&logo=vitest&logoColor=white)

<p align="center">
  <b>Nền tảng Two-Sided Marketplace hiện đại, an toàn và minh bạch kết nối Sinh viên tìm việc làm thêm linh hoạt với Nhà tuyển dụng & Doanh nghiệp.</b>
</p>

[Xem Hướng Dẫn Deploy & Vận Hành](DEPLOYMENT_GUIDE.md) • [Xem Đặc Tả Kỹ Thuật (Specification)](SPECIFICATION.md)

</div>

---

## 📌 1. Giới thiệu Dự án

**StudentJobs** là giải pháp nền tảng web toàn diện được thiết kế chuyên biệt cho thị trường việc làm bán thời gian (part-time) và công việc ngắn hạn dành cho sinh viên tại Việt Nam.

Hệ thống giải quyết triệt để các khó khăn thực tế:
- **Đối với Sinh viên:** Dễ dàng tìm được công việc phù hợp với lịch học, mức lương rõ ràng, doanh nghiệp được xác thực, bảo vệ quyền lợi ứng viên thông qua hệ thống đánh giá hai chiều minh bạch.
- **Đối với Nhà tuyển dụng:** Tiếp cận nhanh chóng nguồn nhân sự trẻ năng động, quy trình đăng tin và duyệt đơn trực quan, tự động kiểm soát số lượng cần tuyển (slots) với cơ chế phòng chống quá tải (Race Condition) bằng Database Row-Level Locking.
- **Đối với Quản trị viên:** Giám sát tin đăng, quản lý tài khoản, kiểm duyệt nội dung và theo dõi thống kê tăng trưởng hệ thống theo thời gian thực.

---

## ✨ 2. Tính năng nổi bật

### 🎓 Dành cho Sinh viên (Student)
- **Tìm kiếm & Lọc nâng cao:** Tìm kiếm theo từ khóa, địa điểm (Tỉnh/Thành phố), mức lương, hình thức ca làm việc và danh mục ngành nghề.
- **Quản lý Hồ sơ & CV chuyên nghiệp:** Tạo thông tin giới thiệu bản thân, kỹ năng và tải lên tệp CV định dạng PDF an toàn (tối đa 5MB).
- **Ứng tuyển & Theo dõi tiến độ:** Nộp đơn nhanh kèm thư giới thiệu, theo dõi trực quan trạng thái đơn qua máy trạng thái (`PENDING` ➔ `ACCEPTED` / `REJECTED` / `WITHDRAWN`).
- **Đánh giá Nhà tuyển dụng:** Đánh giá sao (1-5 ⭐) và nhận xét chất lượng môi trường làm việc sau khi hoàn tất công việc.

### 🏢 Dành cho Nhà tuyển dụng (Employer)
- **Đăng tin & Quản lý tin tuyển dụng:** Đăng mới, chỉnh sửa, đóng tin và quản lý vòng đời công việc (`DRAFT` ➔ `OPEN` ➔ `FILLED` ➔ `COMPLETED` / `CLOSED`).
- **Duyệt ứng viên & Chống quá tải Slot:** Xem hồ sơ sinh viên, duyệt (`ACCEPT`) hoặc từ chối (`REJECT`) đơn. Hệ thống tự động chuyển trạng thái `FILLED` khi đủ chỉ tiêu tuyển dụng và áp dụng giao dịch khóa dòng (`SELECT ... FOR UPDATE`) đảm bảo không nhận vượt số lượng slot.
- **Đánh giá Sinh viên:** Ghi nhận đánh giá năng lực và thái độ làm việc của sinh viên sau khi hoàn thành.
- **Hồ sơ Doanh nghiệp:** Cập nhật thông tin công ty, địa chỉ, số điện thoại liên hệ và website chính thức.

### 🛡️ Dành cho Quản trị viên (Admin)
- **Dashboard Thống kê:** Thống kê tổng quan người dùng, việc làm theo trạng thái, số đơn ứng tuyển và lượt đánh giá.
- **Quản lý & Khóa Người dùng:** Kiểm soát danh sách tài khoản, khóa (`BANNED`) hoặc kích hoạt lại người dùng vi phạm.
- **Kiểm duyệt Tin tuyển dụng & Đánh giá:** Ẩn các tin đăng hoặc nhận xét có nội dung không phù hợp khỏi hệ thống.

### 🔔 Tiện ích Hệ thống
- **Trung tâm Thông báo In-App:** Tự động gửi thông báo thời gian thực khi có ứng viên mới, cập nhật trạng thái đơn, công việc hoàn thành hoặc nhận đánh giá mới.
- **Giao diện Responsive Mobile-First:** Tương thích hoàn hảo trên mọi thiết bị (Mobile, Tablet, Desktop) với Sidebar Drawer tiện lợi và màu sắc chủ đạo xanh doanh nghiệp `#0065c9`.

---

## 🛠️ 3. Công nghệ sử dụng (Tech Stack)

| Thành phần | Công nghệ | Chi tiết |
|---|---|---|
| **Frontend** | React 18, Vite, TypeScript | SPA hiệu năng cao, tối ưu bundle |
| **State & Cache** | TanStack Query v5 (React Query) | Quản lý server state, auto-refetch & caching |
| **Routing** | React Router v6 | Phân quyền 2 lớp kết hợp `ProtectedRoute` theo role |
| **Styling & UI** | Tailwind CSS, Lucide Icons | Thiết kế chuẩn mực, hiện đại, mobile-first |
| **Form & Validate** | React Hook Form, Zod | Validate dữ liệu client-side và schema an toàn |
| **Backend** | Node.js 20, Express, TypeScript | Kiến trúc 3 lớp: `Routes` ➔ `Controllers` ➔ `Services` |
| **Database & ORM** | PostgreSQL 16, Prisma ORM | Migration tự động, type-safe query, seed dữ liệu mẫu |
| **Xác thực & Bảo mật** | JWT HttpOnly Cookie, Bcrypt, Helmet | Chống XSS, CSRF, Rate Limiting chống brute-force |
| **Upload CV** | Multer | Lọc MIME type PDF, giới hạn 5MB, mã hóa tên file ngẫu nhiên |
| **Kiểm thử (Testing)** | Vitest, Supertest | Đạt 100% Pass (93/93 tests) cho toàn bộ 10 Business Rules |
| **Đóng gói & Chạy** | Docker, Docker Compose | Khởi chạy 1 lệnh đầy đủ Database, Server và Client |

---

## 📋 4. Quy tắc nghiệp vụ cốt lõi (10 Business Rules)

Hệ thống được thiết kế và kiểm thử nghiêm ngặt theo 10 quy tắc nghiệp vụ:

1. **BR1:** Mỗi sinh viên chỉ được nộp **1 đơn ứng tuyển cho 1 công việc** (Unique `job_id + student_id`).
2. **BR2:** Chỉ cho phép nộp đơn khi công việc ở trạng thái `OPEN`, chưa quá hạn nộp (`deadline`) và không bị ẩn.
3. **BR3:** Chỉ Nhà tuyển dụng sở hữu công việc mới có quyền xem danh sách ứng viên và thay đổi trạng thái đơn.
4. **BR4:** Chỉ được phép đánh giá khi công việc đã `COMPLETED` **và** đơn của sinh viên đó ở trạng thái `ACCEPTED`.
5. **BR5:** Mỗi bên chỉ được đánh giá đối phương **1 lần** cho mỗi đơn (Điểm từ 1 đến 5 sao).
6. **BR6:** Quản trị viên có quyền ẩn các đánh giá vi phạm; điểm trung bình hiển thị tự động loại trừ review bị ẩn.
7. **BR7:** Đăng ký công khai chỉ áp dụng cho vai trò `STUDENT` hoặc `EMPLOYER`. Tài khoản `ADMIN` được khởi tạo an toàn qua seed.
8. **BR8:** Quản lý hồ sơ doanh nghiệp và trạng thái xác thực nhà tuyển dụng.
9. **BR9:** Tự động sinh thông báo in-app chính xác cho mọi chuyển đổi trạng thái đơn và sự kiện liên quan.
10. **BR10:** Kiểm soát số lượng tuyển dụng `slots`; tự động chuyển sang `FILLED` khi đủ người và khóa dòng ngăn chặn vượt slot khi có nhiều người duyệt đồng thời.

---

## 📁 5. Cấu trúc thư mục Monorepo

```
student-jobs-platform/
├── client/                     # Ứng dụng Frontend (React 18 + Vite + TS)
│   ├── src/
│   │   ├── api/                # API client (Axios instance + Zod parsing)
│   │   ├── components/         # UI Components (Navbar, Sidebar, JobCard, Modal...)
│   │   ├── context/            # AuthContext & Global state
│   │   ├── pages/              # Màn hình (Home, Auth, Jobs, Student, Employer, Admin)
│   │   ├── routes/             # Định tuyến & ProtectedRoute
│   │   └── types/              # TypeScript Interfaces & Enums
│   └── package.json
│
├── server/                     # Ứng dụng Backend API (Node.js + Express + Prisma)
│   ├── prisma/                 # Prisma Schema, Migrations & Database Seed
│   ├── src/
│   │   ├── config/             # Cấu hình biến môi trường & Prisma client
│   │   ├── middlewares/        # Authenticate, Authorize, Rate Limiter, Multer
│   │   ├── modules/            # Các module nghiệp vụ (Auth, Profile, Job, Application, Review, Notification, Admin)
│   │   └── utils/              # AppError, Response Handler, JWT Token Helper
│   ├── tests/                  # Bộ Test Suites (9 file test, 93 test cases)
│   └── package.json
│
├── DEPLOYMENT_GUIDE.md         # Hướng dẫn chi tiết chạy cục bộ, Git & Deploy (VPS/Docker/cPanel/Cloud)
├── SPECIFICATION.md            # Tài liệu đặc tả yêu cầu kỹ thuật chi tiết
└── docker-compose.yml          # Cấu hình Docker toàn diện (Postgres + Server + Client)
```

---

## 🚀 6. Hướng dẫn Khởi chạy Nhanh

### Cách 1: Sử dụng Docker Compose (Khuyên dùng)
```bash
docker-compose up --build
```
- **Frontend Web:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`

---

### Cách 2: Chạy Local Development

#### Bước 1: Khởi động Backend
```bash
cd server
npm install
cp .env.example .env     # Cấu hình chuỗi kết nối DATABASE_URL nếu cần
npx prisma migrate dev
npx prisma db seed       # Bơm dữ liệu mẫu ban đầu
npm run dev
```

#### Bước 2: Khởi động Frontend
```bash
cd client
npm install
npm run dev
```

---

## 🔑 7. Tài khoản Mẫu Kiểm thử (Seed Accounts)

| Vai trò | Email đăng nhập | Mật khẩu mặc định | Ghi chú |
|---|---|---|---|
| 👑 **Quản trị viên (Admin)** | `admin@studentjobs.vn` | `Admin@123456` | Toàn quyền kiểm duyệt & quản trị hệ thống |
| 🏢 **Nhà tuyển dụng (Employer)** | `employer@demo.com` | `Employer@123456` | Đã có sẵn các tin tuyển dụng mẫu |
| 🎓 **Sinh viên (Student)** | `student@demo.com` | `Student@123456` | Đã có hồ sơ cá nhân và đơn ứng tuyển mẫu |

---

## 🧪 8. Chạy Kiểm thử Tự động (Automated Tests)

Chạy toàn bộ 9 bộ test tự động kiểm tra tính đúng đắn của toàn bộ API và 10 quy tắc nghiệp vụ:

```bash
cd server
npm test
```

**Kết quả kiểm thử:**
```text
 ✓ tests/health.test.ts (2 tests)
 ✓ tests/profile.test.ts (7 tests)
 ✓ tests/auth.test.ts (10 tests)
 ✓ tests/notification.test.ts (8 tests)
 ✓ tests/job.test.ts (12 tests)
 ✓ tests/review.test.ts (12 tests)
 ✓ tests/application.test.ts (13 tests)
 ✓ tests/admin.test.ts (12 tests)
 ✓ tests/business-rules-br1-br10.test.ts (17 tests)

 Test Files  9 passed (9)
      Tests  93 passed (93)
```

---

## 📖 9. Tài liệu bổ trợ

- 📘 [**DEPLOYMENT_GUIDE.md**](DEPLOYMENT_GUIDE.md): Hướng dẫn chi tiết cách đẩy mã nguồn lên GitHub, quy trình clone về máy mới, và các phương án Deploy thực tế (VPS Linux, Docker Compose, Nginx + PM2 + SSL Certbot, Cloud PaaS Render/Railway/Vercel, cPanel).
- 📑 [**SPECIFICATION.md**](SPECIFICATION.md): Tài liệu đặc tả nghiệp vụ, mô hình dữ liệu ERD, danh sách endpoint REST API và kế hoạch triển khai 10 giai đoạn.

---

<div align="center">
  <sub>Phát triển & Hoàn thiện bởi <b>StudentJobs Engineering Team</b> &copy; 2026.</sub>
</div>