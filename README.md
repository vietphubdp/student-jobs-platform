# Nền tảng việc làm part-time cho sinh viên: Phân tích nghiệp vụ và kế hoạch triển khai

> 📘 **Tài liệu hướng dẫn vận hành & Deploy**: Xem chi tiết tại [DEPLOYMENT_GUIDE.md](file:///d:/Projects/job-sv/DEPLOYMENT_GUIDE.md) (Hướng dẫn chạy dự án, đẩy lên GitHub, Clone về máy mới, và Deploy lên VPS / Docker / cPanel / Cloud PaaS).

---

## 1. Mục tiêu và phạm vi đề tài

### 1.1. Mục tiêu
Xây dựng một nền tảng web hai chiều (two-sided marketplace) kết nối sinh viên tìm việc làm thêm với nhà tuyển dụng/cá nhân có nhu cầu thuê nhân sự ngắn hạn. Nền tảng cho phép đăng tin, tìm kiếm, ứng tuyển, quản lý trạng thái công việc và đánh giá sau khi hoàn thành.

### 1.2. Phạm vi (theo đề tài)
1. Đăng ký/đăng nhập, phân quyền 3 vai trò: Sinh viên, Nhà tuyển dụng, Quản trị viên.
2. Nhà tuyển dụng đăng tin việc làm part-time (mô tả, thời gian, mức lương, địa điểm).
3. Sinh viên tìm kiếm, lọc theo ngành nghề/địa điểm/mức lương, ứng tuyển kèm hồ sơ (CV/giới thiệu bản thân).
4. Nhà tuyển dụng xem danh sách ứng viên, duyệt/từ chối ứng tuyển.
5. Theo dõi trạng thái công việc (đang tuyển, đã nhận người, hoàn thành).
6. Đánh giá hai chiều sau khi công việc hoàn thành (SV đánh giá NTD và ngược lại).
7. Thông báo cơ bản khi có cập nhật trạng thái ứng tuyển.

---

## 2. Phân tích nghiệp vụ

### 2.1. Các vai trò (actor)

| Vai trò | Mô tả | Quyền chính |
|---|---|---|
| **Sinh viên (SV)** | Người tìm việc part-time | Quản lý hồ sơ, tìm/lọc job, ứng tuyển, theo dõi đơn, rút đơn, đánh giá NTD |
| **Nhà tuyển dụng (NTD)** | Doanh nghiệp/cá nhân thuê SV | Đăng/sửa/đóng job, duyệt hoặc từ chối ứng viên, cập nhật trạng thái job, đánh giá SV |
| **Quản trị viên (Admin)** | Vận hành hệ thống | Quản lý user, kiểm duyệt job và đánh giá, xem thống kê |

### 2.2. Luồng nghiệp vụ chính

1. NTD đăng ký, đăng nhập, đăng job (trạng thái **OPEN**, tức đang tuyển).
2. SV tìm và lọc job, rồi nộp đơn kèm CV và giới thiệu bản thân.
3. NTD xem danh sách ứng viên và **duyệt** hoặc **từ chối**. Mỗi thay đổi trạng thái đơn gửi thông báo cho SV.
4. Khi số đơn được duyệt đạt số lượng cần tuyển, job chuyển sang **FILLED** (đã nhận người).
5. Sau khi làm xong, NTD đánh dấu **COMPLETED** (hoàn thành).
6. Hai bên đánh giá lẫn nhau (chỉ được đánh giá sau khi job hoàn thành).

### 2.3. Máy trạng thái

**Job**
```
DRAFT (tuỳ chọn) → OPEN → FILLED → COMPLETED
                     ↓        ↓
                   CLOSED   CLOSED
```
- `OPEN → FILLED`: tự động khi số đơn ACCEPTED bằng số lượng cần tuyển, hoặc NTD chuyển thủ công.
- `FILLED → OPEN`: cho phép nếu NTD hủy một ứng viên đã nhận khiến số người nhận thấp hơn số lượng cần tuyển.
- `FILLED → COMPLETED`: chỉ NTD sở hữu job thực hiện.
- `OPEN/FILLED → CLOSED`: NTD đóng tin (không tuyển nữa).
- Không cho quay lại từ `COMPLETED` hoặc `CLOSED`.

**Đơn ứng tuyển (Application)**
```
PENDING → ACCEPTED
PENDING → REJECTED
PENDING → WITHDRAWN        (SV tự rút)
ACCEPTED → WITHDRAWN       (SV rút sau khi được nhận, trước khi job COMPLETED, ghi lý do)
ACCEPTED → REJECTED        (NTD hủy ứng viên đã nhận, ghi lý do)
```

### 2.4. Quy tắc nghiệp vụ (Business Rules)

- **BR1.** Mỗi SV chỉ nộp **1 đơn cho 1 job** (unique `job_id + student_id`).
- **BR2.** Chỉ nộp đơn khi job ở trạng thái `OPEN`, chưa quá hạn nộp (`deadline`) và job không bị ẩn.
- **BR3.** Chỉ NTD sở hữu job mới xem được ứng viên và đổi trạng thái đơn của job đó.
- **BR4.** Chỉ đánh giá khi job ở trạng thái `COMPLETED` **và** đơn của SV đó ở trạng thái `ACCEPTED`.
- **BR5.** Mỗi bên chỉ đánh giá đối phương **1 lần** cho mỗi đơn (unique `application_id + reviewer_id`). Điểm từ 1 đến 5 sao, nhận xét tùy chọn.
- **BR6.** Đánh giá không được sửa sau 7 ngày (đề xuất). Admin có thể ẩn đánh giá vi phạm.
- **BR7.** Đăng ký công khai chỉ cho role `STUDENT` hoặc `EMPLOYER`. Tài khoản Admin tạo bằng seed.
- **BR8.** NTD mới có thể cần Admin duyệt tài khoản trước khi đăng job (đề xuất, bật/tắt qua biến cấu hình `REQUIRE_EMPLOYER_APPROVAL`).
- **BR9.** Mỗi thay đổi trạng thái đơn tạo 1 thông báo cho SV. Đơn mới được nộp tạo 1 thông báo cho NTD.
- **BR10.** Job có `slots` (số lượng cần tuyển), mặc định 1, cho phép nhiều. Không được nhận vượt số slot.

### 2.5. Các điểm đề tài chưa rõ (giả định đã chốt)

| Vấn đề | Giả định |
|---|---|
| Thông báo qua kênh nào? | In-app (chuông thông báo). Email là mở rộng sau |
| CV là file hay link? | Upload PDF (tối đa 5MB) và/hoặc nhập text giới thiệu |
| Có thanh toán/lương qua hệ thống? | **Không**. Lương chỉ là thông tin hiển thị |
| Admin làm gì? | Quản lý user, ẩn job/đánh giá vi phạm, dashboard thống kê cơ bản |
| Có chat không? | Không |

---

## 3. Tech stack (bắt buộc, không tự đổi)

| Lớp | Công nghệ | Ghi chú |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript | SPA, không cần SSR |
| Routing / data | React Router v6 + TanStack Query | Query lo cache, loading, error |
| UI | Tailwind CSS (+ shadcn/ui nếu muốn) | Mobile-first |
| Form | React Hook Form + Zod | |
| Backend | Node.js 20 + Express + TypeScript | Kiến trúc routes → controllers → services |
| DB | PostgreSQL 16 + **Prisma ORM** | Migration + seed, type-safe |
| Auth | JWT lưu trong **httpOnly cookie** + bcrypt | Không lưu token ở localStorage |
| Validation | Zod (middleware `validate(schema)`) | |
| Upload CV | Multer (PDF, tối đa 5MB) | Dev lưu `/uploads`, prod dùng S3-compatible |
| Bảo mật | helmet, cors (whitelist), express-rate-limit | Rate limit riêng cho `/auth/login` |
| Test | Vitest/Jest + Supertest (API), Playwright (e2e) | |
| Deploy | Docker Compose: `client`, `server`, `postgres` | |

Giao diện **tiếng Việt**, responsive mobile-first.

---

## 4. Cấu trúc thư mục (monorepo)

```
student-jobs/
├── docker-compose.yml
├── README.md
├── server/
│   ├── prisma/ (schema.prisma, migrations/, seed.ts)
│   ├── src/
│   │   ├── app.ts, server.ts
│   │   ├── config/        (env, db)
│   │   ├── middlewares/   (authenticate, authorize, validate, errorHandler, upload)
│   │   ├── modules/
│   │   │   ├── auth/ profile/ job/ application/ review/ notification/ admin/
│   │   │   └── (mỗi module: routes, controller, service, schema)
│   │   └── utils/         (AppError, jwt, pagination)
│   └── tests/
└── client/
    └── src/
        ├── api/           (axios instance + hàm gọi API theo module)
        ├── components/    (ui, layout, JobCard, StatusBadge, RatingStars...)
        ├── features/      (auth, jobs, applications, reviews, notifications, admin)
        ├── routes/        (ProtectedRoute theo role)
        ├── pages/
        └── hooks/
```

---

## 5. Mô hình dữ liệu (ERD rút gọn)

```
User(id, email UNIQUE, password_hash, role[STUDENT|EMPLOYER|ADMIN],
     status[ACTIVE|PENDING|BANNED], created_at)

StudentProfile(user_id PK/FK, full_name, phone, university, major, bio, cv_url, skills[])
EmployerProfile(user_id PK/FK, company_name, description, address, phone, website, is_verified)

Category(id, name UNIQUE)                       -- ngành nghề

Job(id, employer_id FK, category_id FK, title, description,
    work_time, salary_min, salary_max, salary_unit[HOUR|DAY|MONTH|JOB],
    location, city, slots DEFAULT 1, deadline,
    status[DRAFT|OPEN|FILLED|COMPLETED|CLOSED], is_hidden,
    created_at, updated_at, completed_at)

Application(id, job_id FK, student_id FK, cover_letter, cv_url,
            status[PENDING|ACCEPTED|REJECTED|WITHDRAWN], reject_reason,
            created_at, updated_at)
  UNIQUE(job_id, student_id)

Review(id, application_id FK, reviewer_id FK, reviewee_id FK,
       rating 1-5, comment, is_hidden, created_at)
  UNIQUE(application_id, reviewer_id)

Notification(id, user_id FK, type, title, content, link, is_read, created_at)
```

**Index cần có:** `Job(status, category_id, city, salary_min)`, `Application(job_id, status)`, `Notification(user_id, is_read)`.

---

## 6. Danh sách API (REST, prefix `/api`)

**Hệ thống**
- `GET /api/health`

**Auth**
- `POST /api/auth/register` (role: STUDENT/EMPLOYER)
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`

**Profile**
- `GET/PUT /api/profile/me`
- `POST /api/profile/cv` (upload PDF)

**Job**
- `GET /api/jobs?q=&category=&location=&salaryMin=&salaryMax=&status=&page=&sort=` (public)
- `GET /api/jobs/:id`
- `POST /api/jobs` (EMPLOYER)
- `PUT /api/jobs/:id`, `DELETE /api/jobs/:id` (chủ job)
- `PATCH /api/jobs/:id/status` (chủ job, kiểm tra máy trạng thái)
- `GET /api/employer/jobs` (job của tôi)

**Application**
- `POST /api/jobs/:id/applications` (STUDENT)
- `GET /api/student/applications` (đơn của tôi)
- `PATCH /api/applications/:id/withdraw` (STUDENT)
- `GET /api/jobs/:id/applications` (NTD chủ job)
- `PATCH /api/applications/:id/status` (NTD: accept/reject)

**Review**
- `POST /api/applications/:id/reviews`
- `GET /api/users/:id/reviews` (kèm điểm trung bình)

**Notification**
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`

**Admin**
- `GET /api/admin/users`, `PATCH /api/admin/users/:id/status`
- `GET /api/admin/jobs`, `PATCH /api/admin/jobs/:id/hide`
- `PATCH /api/admin/reviews/:id/hide`
- `GET /api/admin/stats`

---

## 7. Danh sách màn hình

| Nhóm | Màn hình |
|---|---|
| Public | Trang chủ, danh sách job (lọc + tìm), chi tiết job, đăng nhập, đăng ký |
| Sinh viên | Hồ sơ cá nhân (upload CV), đơn ứng tuyển của tôi (kèm trạng thái), form ứng tuyển, đánh giá NTD |
| NTD | Hồ sơ công ty, đăng/sửa job, danh sách job của tôi, danh sách ứng viên theo job (duyệt/từ chối), cập nhật trạng thái job, đánh giá SV |
| Chung | Chuông thông báo, trang xem hồ sơ + đánh giá của 1 user |
| Admin | Dashboard, quản lý user, quản lý job, quản lý đánh giá |

---

## 8. Kế hoạch triển khai theo giai đoạn

Mỗi giai đoạn gồm cả backend và frontend để nghiệm thu được trên giao diện. **Chỉ chuyển giai đoạn khi người dùng xác nhận.**

| GĐ | Nội dung | Nghiệm thu |
|---|---|---|
| **0** | Khởi tạo monorepo, Docker Compose, Prisma schema + migration + seed (admin, categories, dữ liệu mẫu), health check `/api/health`, trang React trống | `docker compose up` chạy cả 3 service; seed thành công |
| **1** | Auth (register/login/logout/me), middleware phân quyền, layout + `ProtectedRoute` theo role | Sai role bị `403` ở API và bị chuyển hướng ở UI |
| **2** | Profile SV/NTD + upload CV (Multer) | PDF hợp lệ lưu được; sai định dạng hoặc >5MB bị từ chối |
| **3** | CRUD Job + máy trạng thái + trang "Job của tôi" (NTD) | Chuyển trạng thái sai trả `400`; người không phải chủ job trả `403` |
| **4** | Danh sách + lọc + tìm kiếm + phân trang job (public) | Kết hợp nhiều bộ lọc cho kết quả đúng; URL giữ query để chia sẻ |
| **5** | Ứng tuyển + quản lý ứng viên (transaction) | Không nộp trùng (BR1); đủ slot thì job tự `FILLED`; không vượt slot khi thao tác đồng thời |
| **6** | Theo dõi trạng thái công việc, NTD đánh dấu hoàn thành | Hiển thị đúng ở cả hai phía |
| **7** | Đánh giá hai chiều + điểm trung bình trên hồ sơ | Đúng BR4–BR6 |
| **8** | Thông báo in-app (chuông, đếm chưa đọc, đánh dấu đã đọc) | Mọi sự kiện BR9 đều sinh thông báo |
| **9** | Trang Admin | Khóa user, ẩn job/đánh giá, xem thống kê |
| **10** | Test (unit BR1–BR10, Supertest cho API, e2e luồng chính), README, rà soát bảo mật | Test pass; chạy được từ README |

---

## 9. Yêu cầu kỹ thuật bắt buộc

1. **Phân quyền hai lớp.** Backend dùng `authenticate` rồi `authorize('EMPLOYER')`. Frontend dùng `ProtectedRoute` chỉ để điều hướng và ẩn nút, **không** thay cho kiểm tra ở server.
2. **Kiểm tra quyền sở hữu (BR3)** nằm trong service: NTD chỉ thao tác trên job có `employer_id = req.user.id`.
3. **Máy trạng thái** viết thành hàm thuần `canTransition(from, to)` để unit test dễ. Chuyển sai thì trả `400`.
4. **Race condition khi duyệt ứng viên:** việc "accept đơn, đếm số ACCEPTED, tự chuyển job sang FILLED" phải nằm trong **một transaction** (`prisma.$transaction`), kèm khóa dòng job (`SELECT ... FOR UPDATE` qua `$queryRaw`) để không nhận vượt số slot.
5. **Thông báo (BR9)** tạo trong cùng transaction với việc đổi trạng thái đơn.
6. **Response thống nhất:** thành công `{ data, meta }`; lỗi `{ error: { code, message, details } }`. Có `errorHandler` tập trung và lớp `AppError`.
7. **Auth cookie:** JWT trong cookie `httpOnly`, `SameSite` cấu hình đúng, `secure` ở production. Dev dùng Vite proxy `/api` sang server.
8. **Thông báo in-app:** polling 30–60 giây bằng TanStack Query (`refetchInterval`), chưa cần WebSocket.
9. **Upload:** kiểm tra mimetype thật và dung lượng, đổi tên file ngẫu nhiên, không cho truy cập thư mục ngoài `/uploads`.
10. **Mọi danh sách có phân trang.** Mật khẩu tối thiểu 8 ký tự, không trả `password_hash` trong bất kỳ response nào.
11. **Rate limit** cho `/api/auth/login` và `/api/auth/register`.

---

## 10. Ngoài phạm vi (không được tự làm)

Thanh toán/lương qua hệ thống, chat realtime, đăng nhập mạng xã hội, app mobile native, AI gợi ý việc làm, gửi email.

---

## 12. Hướng dẫn cài đặt & Kiểm thử (Phase 10)

### 12.1. Yêu cầu môi trường
- **Node.js**: >= 20.x
- **PostgreSQL**: 16.x (qua Docker hoặc cài đặt cục bộ)
- **npm**: >= 10.x

---

### 12.2. Khởi chạy hệ thống

#### Cách 1: Sử dụng Docker Compose (Toàn bộ Server + Client + DB)
```bash
docker-compose up --build
```

#### Cách 2: Chạy Local Development

1. **Khởi chạy PostgreSQL & cấu hình biến môi trường**:
   - `server/.env`:
     ```env
     PORT=5000
     DATABASE_URL="postgresql://postgres:postgres@localhost:5432/job_sv_db?schema=public"
     JWT_SECRET="super-secret-jwt-key-for-development-32chars-min"
     JWT_EXPIRES_IN="7d"
     NODE_ENV="development"
     CLIENT_URL="http://localhost:5173"
     ```

2. **Cài đặt & Di chuyển CSDL Backend**:
   ```bash
   cd server
   npm install
   npx prisma migrate dev --name init
   npx prisma db seed
   npm run dev
   ```
   *Backend chạy tại:* `http://localhost:5000`

3. **Cài đặt & Khởi chạy Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *Frontend chạy tại:* `http://localhost:5173`

---

### 12.3. Tài khoản mẫu kiểm thử (Default Seed Accounts)

| Vai trò | Email | Mật khẩu | Mô tả |
|---|---|---|---|
| **Admin** | `admin@studentjobs.vn` | `Admin@123456` | Quản trị viên hệ thống |
| **Employer** | `employer@demo.com` | `Employer@123456` | Nhà tuyển dụng mẫu |
| **Student** | `student@demo.com` | `Student@123456` | Sinh viên tìm việc |

---

### 12.4. Chạy toàn bộ Test Suite (9/9 Test Files, 93/93 Tests Passed)

```bash
cd server
npm test
```

Danh sách các bộ kiểm thử tự động:
1. `tests/health.test.ts`: Health check endpoint.
2. `tests/auth.test.ts`: Đăng ký, đăng nhập, phân quyền, httpOnly cookie & rate limiting.
3. `tests/profile.test.ts`: Quản lý hồ sơ cá nhân và upload file CV PDF.
4. `tests/job.test.ts`: CRUD công việc, lọc theo nhiều tiêu chí, máy trạng thái Job.
5. `tests/application.test.ts`: Nộp đơn, quản lý ứng viên, giao dịch khóa slots chống race-condition.
6. `tests/review.test.ts`: Đánh giá hai chiều sau khi hoàn thành, tính điểm trung bình.
7. `tests/notification.test.ts`: Đánh dấu đọc thông báo, tạo thông báo tự động theo trạng thái.
8. `tests/admin.test.ts`: Khóa/mở khóa user, ẩn job/đánh giá, dashboard thống kê.
9. `tests/business-rules-br1-br10.test.ts`: Kiểm thử tích hợp toàn diện 10 quy tắc nghiệp vụ BR1 → BR10.

---

### 12.5. Rà soát bảo mật & Tiêu chuẩn kỹ thuật đã hoàn thành
- [x] **Không lộ mật khẩu:** Loại trừ `password_hash` khỏi tất cả JSON response.
- [x] **Xác thực an toàn:** Lưu JWT trong cookie `httpOnly`, `SameSite=Lax` (hoặc `Strict`), `secure` trong production.
- [x] **Kiểm soát phân quyền 2 lớp:** Middleware `authenticate` và `authorize` ở tầng route; logic ownership (BR3) ở tầng service.
- [x] **Rate Limiting:** Áp dụng `express-rate-limit` chống tấn công brute-force vào `/api/auth/login` và `/api/auth/register`.
- [x] **Upload an toàn:** Kiểm tra MIME type (PDF), giới hạn 5MB, sanitize tên tệp ngẫu nhiên bằng UUID.
- [x] **Phòng chống Concurrency:** Sử dụng PostgreSQL Row-Level Lock (`SELECT ... FOR UPDATE` qua transaction) khi duyệt đơn ứng tuyển, ngăn chặn vượt quá số lượng tuyển dụng `slots`.