# Citizen Management – Backend (Node.js + Express + PostgreSQL)

Dịch vụ Backend cho hệ thống Quản lý Công dân, xây dựng bằng Node.js (Express), PostgreSQL (qua `pg` pool và `sequelize` ORM), hỗ trợ xác thực JWT, phân quyền theo vai trò, xuất báo cáo Excel, và tác vụ nền theo lịch.

## Mục lục

- Tổng quan
- Kiến trúc & Công nghệ
- Cấu trúc thư mục
- Biến môi trường (.env)
- Chạy dự án
- API cơ bản
- Xác thực & Phân quyền
- CORS & Bảo mật
- Cơ sở dữ liệu
- Tác vụ định kỳ (Scheduler)
- Xuất báo cáo Excel

## Tổng quan

- Cung cấp REST API cho các nghiệp vụ: quản lý công dân, hộ khẩu, khoản thu, chiến dịch, tìm kiếm và thống kê.
- Xác thực JWT (Bearer token), phân quyền `admin`/`staff`.
- Kết nối PostgreSQL với SSL phù hợp Supabase.
- Có `health` endpoint để kiểm tra tình trạng dịch vụ.

## Kiến trúc & Công nghệ

- Express 5, `cors`, `dotenv`.
- PostgreSQL: `pg` (`Pool`) và `sequelize` ORM.
- Bảo mật: `jsonwebtoken`, `bcryptjs`.
- Lịch chạy nền: `node-cron`.
- Xuất báo cáo: `exceljs`.

Xem cấu hình khởi tạo tại [server/src/index.js](src/index.js).

## Cấu trúc thư mục

- [src/routes/web.js](src/routes/web.js): định nghĩa toàn bộ REST endpoints dưới `/api/v1/...`.
- [src/controllers](src/controllers): xử lý nghiệp vụ (auth, user, person, fee, campaign, statistic, export...).
- [src/middleware](src/middleware): `authMiddleware` (JWT), `roleMiddleware` (vai trò), `errorHandler` (lỗi toàn cục).
- [src/config](src/config): `db.js` (pg Pool), `sequelize.js` (Sequelize + SSL), `config.js` (sequelize-cli env mapping).
- [src/services/schedulerService.js](src/services/schedulerService.js): cron job hàng ngày.
- [src/models](src/models): model Sequelize.

### Sơ đồ thư mục server

```
server/
├─ src/
│  ├─ index.js
│  ├─ routes/
│  │  └─ web.js
│  ├─ controllers/
│  ├─ middleware/
│  ├─ models/
│  ├─ services/
│  │  └─ schedulerService.js
│  ├─ config/
│  │  ├─ config.js
│  │  ├─ db.js
│  │  ├─ sequelize.js
│  │  └─ supabase.js
│  └─ utils/
├─ package.json
└─ README.md
```

Ghi chú:
- Điểm khởi động: [src/index.js](src/index.js); mount tất cả routes dưới `/api/v1`.
- Cấu hình DB/ORM: [src/config/db.js](src/config/db.js), [src/config/sequelize.js](src/config/sequelize.js), [src/config/config.js](src/config/config.js).
- Lịch cron: [src/services/schedulerService.js](src/services/schedulerService.js).
- Middleware: [src/middleware](src/middleware) gồm xác thực JWT, kiểm tra vai trò và xử lý lỗi.
- Tổ chức controller theo domain trong [src/controllers](src/controllers).
- Nếu triển khai Supabase, chứng chỉ SSL không chuẩn → `rejectUnauthorized: false` trong Sequelize.

## Biến môi trường (.env)

Tạo file `.env` trong thư mục `server` với các biến sau:

```env
# Cổng dịch vụ
PORT=5000

# Danh sách origin FE cho CORS (phân tách bằng dấu phẩy)
CORS_ALLOWED_ORIGINS=http://localhost:5173

# PostgreSQL (Supabase hoặc tự quản)
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=your_database
DB_HOST=your_host
DB_PORT=5432

# JWT (xác thực)
JWT_SECRET=your_jwt_secret

# Môi trường
NODE_ENV=development
```

Ghi chú:
- SSL cho PostgreSQL được bật trong `sequelize` và `pg` khi production.
- `config/config.js` khai báo profiles `development`, `test`, `production` cho sequelize-cli.

## Chạy dự án

Cài đặt và chạy trên Windows/macOS/Linux:

```bash
cd server
npm install
npm run dev
```

Chạy production (đã build môi trường):

```bash
npm run start
```

## API cơ bản

- Base path: `/api/v1`.
- Health check: `GET /api/v1/health` → `{ success: true, message: "OK" }`.
- Root: `GET /` → chuỗi test "Hello from Node.js backend!".

Ví dụ kiểm tra nhanh:

```bash
curl https://citizen-management-w0w5.onrender.com/api/v1/health
```

## Xác thực & Phân quyền

- FE gửi `Authorization: Bearer <token>` trong header.
- Token được kiểm tra tại [src/middleware/authMiddleware.js](src/middleware/authMiddleware.js) dùng `JWT_SECRET`.
- Phân quyền sử dụng [src/middleware/roleMiddleware.js](src/middleware/roleMiddleware.js) với các vai trò `admin`, `staff`.
- Nhiều endpoint yêu cầu `verifyToken` + `checkRole([...])`.

## CORS & Bảo mật

- Cho phép origin dựa trên `CORS_ALLOWED_ORIGINS` (danh sách phân tách bằng dấu phẩy).
- Header được phép: `Content-Type`, `Authorization`.
- Không dùng `withCredentials` (Bearer token qua header).

## Cơ sở dữ liệu

- Kết nối qua `pg` Pool: xem [src/config/db.js](src/config/db.js).
- ORM Sequelize: xem [src/config/sequelize.js](src/config/sequelize.js). Bật SSL (`require: true`, `rejectUnauthorized: false`).
- Tích hợp Supabase PostgreSQL (chứng chỉ SSL không chuẩn → `rejectUnauthorized: false`).

## Tác vụ định kỳ (Scheduler)

- Cron job chạy lúc 00:01 hàng ngày: quét các hồ sơ tạm vắng hết hạn và khôi phục trạng thái cư trú thường trú.
- Triển khai tại [src/services/schedulerService.js](src/services/schedulerService.js).

## Xuất báo cáo Excel

- Các endpoint nhóm `GET /api/v1/export/...` tạo báo cáo thu phí, đóng góp, phiếu thu.
- Sử dụng `exceljs` để dựng file Excel từ dữ liệu.

---

Để tích hợp với Frontend, set `VITE_API_URL` của FE trỏ đến `http://<host>:<PORT>`. Kiểm tra CORS để đảm bảo domain FE xuất hiện trong `CORS_ALLOWED_ORIGINS`.
