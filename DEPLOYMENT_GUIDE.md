# HƯỚNG DẪN VẬN HÀNH, QUẢN LÝ GIT & DEPLOY DỰ ÁN STUDENTJOBS

Tài liệu này hướng dẫn chi tiết từ A - Z cách chạy dự án ở môi trường cục bộ (Local Development), cách đồng bộ mã nguồn lên GitHub & clone về máy mới, cùng các phương án triển khai (Deployment) lên môi trường thực tế (VPS, cPanel, Cloud PaaS, Docker, v.v.).

---

## MỤC LỤC

1. [Yêu cầu môi trường & Cấu hình](#1-yêu-cầu-môi-trường--cấu-hình)
2. [Cách chạy dự án ở môi trường Local](#2-cách-chạy-dự-án-ở-môi-trường-local)
   - [Phương án A: Chạy trực tiếp qua Node.js (Khuyên dùng khi lập trình)](#phương-án-a-chạy-trực-tiếp-qua-nodejs)
   - [Phương án B: Chạy toàn bộ qua Docker Compose](#phương-án-b-chạy-toàn-bộ-qua-docker-compose)
3. [Hướng dẫn Git & GitHub: Push lên và Clone về máy mới](#3-hướng-dẫn-git--github)
   - [3.1. Đẩy mã nguồn lần đầu lên GitHub](#31-đẩy-mã-nguồn-lần-đầu-lên-github)
   - [3.2. Cập nhật mã nguồn sau này (Add, Commit, Push)](#32-cập-nhật-mã-nguồn-sau-này)
   - [3.3. Hướng dẫn Clone về máy mới và khởi động lại từ đầu](#33-hướng-dẫn-clone-về-máy-mới-và-khởi-động-từ-đầu)
4. [Hướng dẫn Deploy lên các nền tảng khác nhau](#4-hướng-dẫn-deploy)
   - [Cách 1: Deploy lên VPS Linux (Ubuntu / Debian) bằng Docker Compose (Khuyên dùng)](#cách-1-deploy-lên-vps-bằng-docker-compose)
   - [Cách 2: Deploy lên VPS Linux bằng Nginx + PM2 + SSL Certbot](#cách-2-deploy-lên-vps-bằng-nginx--pm2--ssl-certbot)
   - [Cách 3: Deploy lên Cloud PaaS (Render, Railway, Vercel)](#cách-3-deploy-lên-cloud-paas-render--railway--vercel)
   - [Cách 4: Deploy lên Hosting cPanel / Cloud Web Hosting](#cách-4-deploy-lên-hosting-cpanel)
5. [Rà soát an toàn & Checklist trước khi Go-Live](#5-rà-soát-an-toàn--checklist-khi-go-live)

---

## 1. Yêu cầu môi trường & Cấu hình

Trước khi bắt đầu, máy tính của bạn cần cài đặt:
- **Node.js**: Phiên bản `>= 20.x` ([Tải Node.js](https://nodejs.org/))
- **Git**: Phiên bản mới nhất ([Tải Git](https://git-scm.com/))
- **PostgreSQL**: Phiên bản `16.x` (Hoặc cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop/) nếu muốn dùng Docker)

---

## 2. Cách chạy dự án ở môi trường Local

### Phương án A: Chạy trực tiếp qua Node.js

#### Bước 1: Chuẩn bị cơ sở dữ liệu PostgreSQL
Đảm bảo PostgreSQL đang chạy trên máy (mặc định port `5432`). Tạo cơ sở dữ liệu có tên `student_jobs` (hoặc `job_sv_db`).

#### Bước 2: Cài đặt và chạy Backend (Server)
1. Mở terminal, chuyển vào thư mục `server`:
   ```bash
   cd server
   ```
2. Tạo file `.env` từ file mẫu:
   - Trên Windows PowerShell:
     ```powershell
     Copy-Item .env.example .env
     ```
   - Trên Linux/macOS/Git Bash:
     ```bash
     cp .env.example .env
     ```
3. Cấu hình nội dung `server/.env` (điều chỉnh mật khẩu postgres của bạn):
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/student_jobs?schema=public"
   JWT_SECRET="chuoi-khoa-bao-mat-jwt-ngau-nhien-it-nhat-32-ky-tu"
   CLIENT_URL="http://localhost:5173"
   COOKIE_DOMAIN="localhost"
   REQUIRE_EMPLOYER_APPROVAL=false
   NODE_ENV="development"
   ```
4. Cài đặt thư viện, khởi tạo cơ sở dữ liệu và seed dữ liệu mẫu:
   ```bash
   npm install
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
5. Khởi động Backend server:
   ```bash
   npm run dev
   ```
   *Backend hoạt động tại:* `http://localhost:5000` (Kiểm tra sức khỏe: `http://localhost:5000/api/health`)

#### Bước 3: Cài đặt và chạy Frontend (Client)
1. Mở một cửa sổ Terminal mới, chuyển vào thư mục `client`:
   ```bash
   cd client
   ```
2. Cài đặt thư viện:
   ```bash
   npm install
   ```
3. Khởi động Frontend server:
   ```bash
   npm run dev
   ```
   *Frontend hoạt động tại:* `http://localhost:5173`

---

### Phương án B: Chạy toàn bộ qua Docker Compose

Nếu máy bạn đã cài Docker Desktop, bạn có thể chạy toàn bộ 3 dịch vụ (PostgreSQL + Express Backend + Vite React Frontend) chỉ với 1 câu lệnh duy nhất:

1. Tại thư mục gốc của dự án (`job-sv/`), chạy lệnh:
   ```bash
   docker-compose up --build
   ```
2. Chờ Docker build image và khởi tạo container.
3. Truy cập:
   - **Frontend**: `http://localhost:5173`
   - **Backend API**: `http://localhost:5000`
4. Để dừng hệ thống: Nhấn `Ctrl + C` hoặc gõ `docker-compose down`.

---

## 3. Hướng dẫn Git & GitHub

### 3.1. Đẩy mã nguồn lần đầu lên GitHub

1. **Tạo repository mới trên GitHub**:
   - Truy cập [GitHub](https://github.com/) -> Nhấn **New Repository**.
   - Đặt tên repo (ví dụ: `student-jobs-platform`), để chế độ **Public** hoặc **Private** -> Nhấn **Create repository**.
   - Sao chép đường link Git (ví dụ: `https://github.com/your-username/student-jobs-platform.git`).

2. **Khởi tạo và đẩy mã nguồn từ máy tính**:
   Mở terminal tại thư mục gốc của dự án (`d:\Projects\job-sv`):
   ```bash
   # 1. Khởi tạo Git nếu chưa có
   git init

   # 2. Kiểm tra trạng thái các file (đảm bảo file .env và node_modules đã nằm trong .gitignore)
   git status

   # 3. Thêm tất cả file vào staging
   git add .

   # 4. Commit phiên bản đầu tiên
   git commit -m "feat: complete student jobs platform with 10 business rules"

   # 5. Đổi tên nhánh chính thành main
   git branch -M main

   # 6. Liên kết với repository GitHub vừa tạo
   git remote add origin https://github.com/your-username/student-jobs-platform.git

   # 7. Đẩy mã nguồn lên GitHub
   git push -u origin main
   ```

---

### 3.2. Cập nhật mã nguồn sau này

Mỗi khi bạn sửa đổi hoặc viết thêm tính năng, thực hiện 3 lệnh sau:
```bash
git add .
git commit -m "mô_tả_thay_đổi_ở_đây"
git push
```

---

### 3.3. Hướng dẫn Clone về máy mới và khởi động từ đầu

Khi bạn đổi máy tính hoặc người khác muốn clone dự án về để chạy:

1. **Clone mã nguồn về máy**:
   ```bash
   git clone https://github.com/your-username/student-jobs-platform.git
   cd student-jobs-platform
   ```

2. **Cấu hình Backend**:
   ```bash
   cd server
   npm install

   # Tạo file .env và điền chuỗi kết nối Database
   cp .env.example .env

   # Đồng bộ schema Prisma và tạo bảng trong PostgreSQL
   npx prisma migrate dev

   # Bơm dữ liệu mẫu (Admin, Category, Việc làm mẫu, Tài khoản mẫu)
   npx prisma db seed

   # Chạy Backend
   npm run dev
   ```

3. **Cấu hình Frontend**:
   Mở terminal thứ 2:
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Đăng nhập với các tài khoản Seed mẫu**:
   - **Admin**: `admin@studentjobs.vn` / `Admin@123456`
   - **Nhà tuyển dụng**: `employer@demo.com` / `Employer@123456`
   - **Sinh viên**: `student@demo.com` / `Student@123456`

---

## 4. Hướng dẫn Deploy lên các nền tảng khác nhau

---

### Cách 1: Deploy lên VPS bằng Docker Compose (Khuyên dùng nhất)

Áp dụng cho mọi VPS Linux (Ubuntu 22.04 / 24.04, Debian 12) trên DigitalOcean, Linode, Vultr, AWS EC2, Hetzner, Vietnix, v.v.

1. **Cài đặt Docker & Git trên VPS**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y git curl docker.io docker-compose
   sudo systemctl enable --now docker
   ```

2. **Clone mã nguồn về VPS**:
   ```bash
   cd /var/www
   git clone https://github.com/your-username/student-jobs-platform.git
   cd student-jobs-platform
   ```

3. **Cấu hình file `.env`**:
   Tạo file `.env` ở thư mục gốc:
   ```bash
   nano .env
   ```
   Điền thông tin an toàn:
   ```env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=MatKhauDatabaseSieuKho2026!
   POSTGRES_DB=student_jobs
   POSTGRES_PORT=5432

   PORT=5000
   DATABASE_URL=postgresql://postgres:MatKhauDatabaseSieuKho2026!@postgres:5432/student_jobs?schema=public
   JWT_SECRET=chuoi-khoa-bi-mat-jwt-tren-server-production-64bytes
   CLIENT_URL=https://yourdomain.com
   COOKIE_DOMAIN=.yourdomain.com
   NODE_ENV=production
   ```

4. **Khởi chạy Docker**:
   ```bash
   docker-compose up -d --build
   ```

5. **Chạy Migration & Seed trong Container**:
   ```bash
   docker-compose exec server npx prisma migrate deploy
   docker-compose exec server npx prisma db seed
   ```

---

### Cách 2: Deploy lên VPS bằng Nginx + PM2 + SSL Certbot

Nếu bạn muốn cấu hình chạy thuần không qua Docker để tối ưu hiệu năng phần cứng trên VPS:

#### Bước 1: Cài đặt môi trường trên VPS
```bash
sudo apt update
sudo apt install -y nodejs npm postgresql postgresql-contrib nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

#### Bước 2: Build Frontend
```bash
cd /var/www/student-jobs-platform/client
npm install
npm run build
# Bản build hoàn thiện sẽ nằm tại /var/www/student-jobs-platform/client/dist
```

#### Bước 3: Cấu hình và Chạy Backend với PM2
```bash
cd /var/www/student-jobs-platform/server
npm install
npm run build
npx prisma migrate deploy
npx prisma db seed

# Khởi chạy bằng PM2
pm2 start dist/server.js --name "student-jobs-api"
pm2 save
pm2 startup
```

#### Bước 4: Cấu hình Nginx làm Reverse Proxy
Tạo file cấu hình Nginx:
```bash
sudo nano /etc/nginx/sites-available/studentjobs.conf
```
Dán nội dung cấu hình:
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    # Phục vụ Frontend React
    location / {
        root /var/www/student-jobs-platform/client/dist;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Reverse Proxy sang Backend Express
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Phục vụ file Uploads (CV PDF)
    location /uploads {
        alias /var/www/student-jobs-platform/server/uploads;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

Kích hoạt cấu hình và cấp chứng chỉ SSL miễn phí Let's Encrypt:
```bash
sudo ln -s /etc/nginx/sites-available/studentjobs.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

### Cách 3: Deploy lên Cloud PaaS (Render / Railway / Vercel)

Dành cho bạn nào không muốn tự quản trị hệ điều hành Linux:

#### Mô hình tách biệt (Decoupled Cloud Architecture):
- **Database**: Sử dụng PostgreSQL trên [Neon.tech](https://neon.tech), [Supabase](https://supabase.com), hoặc [Railway](https://railway.app).
- **Backend (Server)**: Deploy lên [Render.com](https://render.com) hoặc [Railway.app](https://railway.app) (Web Service Node.js).
- **Frontend (Client)**: Deploy lên [Vercel.com](https://vercel.com) hoặc [Netlify.com](https://netlify.com).

#### Các bước thực hiện:
1. **Tạo Database trên Neon/Supabase**:
   - Sao chép `DATABASE_URL` dạng `postgresql://user:pass@ep-xyz.neon.tech/dbname?sslmode=require`.
2. **Deploy Backend lên Render**:
   - Kết nối với GitHub repo -> Chọn thư mục gốc là `server`.
   - Build Command: `npm install && npx prisma migrate deploy && npm run build`
   - Start Command: `npm run start` (hoặc `node dist/server.js`)
   - Thêm Environment Variables: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL` (URL của frontend trên Vercel), `NODE_ENV=production`.
3. **Deploy Frontend lên Vercel**:
   - Kết nối GitHub repo -> Chọn Root Directory là `client`.
   - Framework Preset: `Vite`.
   - Cấu hình file `vercel.json` trong `client/` để điều hướng SPA:
     ```json
     {
       "rewrites": [
         { "source": "/api/(.*)", "destination": "https://your-backend-render.onrender.com/api/$1" },
         { "source": "/(.*)", "destination": "/index.html" }
       ]
     }
     ```

---

### Cách 4: Deploy lên Hosting cPanel / Cloud Web Hosting

Dành cho các gói Shared Hosting có hỗ trợ tính năng **Setup Node.js App** (CloudLinux):

1. **Chuẩn bị file**:
   - Build Frontend cục bộ: Tại máy bạn chạy `cd client && npm run build`. Thư mục `client/dist` sẽ được tải lên thư mục `public_html` của cPanel.
   - Nén thư mục `server` (trừ thư mục `node_modules` và `.git`).
2. **Tạo Database PostgreSQL trên cPanel**:
   - Vào mục **PostgreSQL Databases** trên cPanel -> Tạo DB, User và cấp full quyền.
3. **Cấu hình Node.js App trên cPanel**:
   - Vào **Setup Node.js App** -> Nhấn **Create Application**.
   - Node.js version: Chọn `20.x`.
   - Application root: `student-jobs-api`.
   - Application startup file: `dist/server.js`.
   - Thêm các biến môi trường: `DATABASE_URL`, `JWT_SECRET`, `PORT`, `NODE_ENV=production`.
4. **Tải mã nguồn và Build**:
   - Tải file nén `server` lên thư mục `student-jobs-api` qua File Manager -> Giải nén.
   - Nhấn nút **Run NPM Install** và **Restart** ứng dụng trên cPanel.

---

## 5. Rà soát an toàn & Checklist khi Go-Live

Trước khi công bố website cho người dùng thực tế:

- [ ] **Mật khẩu & Khóa bí mật**: Thay đổi toàn bộ mật khẩu mặc định của tài khoản Seed (`admin@studentjobs.vn`, database password) và tạo chuỗi `JWT_SECRET` ngẫu nhiên dài trên 32 ký tự.
- [ ] **Bật HTTPS / SSL**: Đảm bảo domain đã được cấp chứng chỉ SSL để cookie `httpOnly` hoạt động với cờ `secure: true`.
- [ ] **CORS & Cookie Domain**: Đảm bảo `CLIENT_URL` và `COOKIE_DOMAIN` trong file `.env` khớp chính xác với tên miền chính thức của bạn.
- [ ] **Backup Cơ sở dữ liệu**: Thiết lập lịch tự động backup định kỳ cho PostgreSQL (`pg_dump`).
- [ ] **Kiểm tra quyền ghi thư mục Upload**: Đảm bảo thư mục `uploads/` có quyền ghi (`chmod 755` hoặc `775`) để người dùng tải lên file CV PDF.

---
*Tài liệu được biên soạn đồng bộ với phiên bản StudentJobs v1.0.0 (Node.js 20, React 18 Vite, Prisma, PostgreSQL 16).*
