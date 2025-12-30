## Kiến trúc hệ thống

### 🧩 Phân lớp

```
React + Vite (Client)
   ↓  REST API (Axios)
Express (Server)
   ↓  ORM
PostgreSQL (Database)
```

- Mô hình **3-tier** tách biệt UI, logic, dữ liệu.
- API RESTful, **JWT** xác thực, **RBAC** phân quyền.
- **CORS** kiểm soát origin từ FE (5173).
- Tác vụ nền bằng **node-cron** (xử lý tạm trú/tạm vắng).

### 🗂 Frontend (React + TypeScript)

- Modules: `api`, `auth`, `components`, `hooks`, `layouts`, `lib`, `mappers`, `pages`, `routes`, `stores`, `styles`, `types` (xem cấu trúc trong client).
- **React Router v7** cho định tuyến, **React Query v5** cho caching/fetching.
- **Zustand** quản lý state nhẹ; **Tailwind CSS** cho UI.
- `axios` client dùng `VITE_API_URL` và interceptor token/lỗi.

### 🧰 Backend (Express + Sequelize)

- Entry: `server/src/index.js`; mount routes dưới `/api/v1`.
- Controllers: `auth`, `campaign`, `export`, `fee`, `household`, `person`, `search`, `statistic`, `tempResidence`.
- Middleware: `authMiddleware` (JWT), `roleMiddleware` (RBAC), `errorHandler`.
- Config DB: `pg Pool` + `Sequelize` (SSL khi production/Supabase).
- Scheduler: `services/schedulerService.js` chạy hàng ngày 00:01.

### 🗃 Schema PostgreSQL

- **core:** `person`, `household`, `household_membership`, `person_event`, `temp_permit`.
- **finance:** `fee_rate`, `payment`, `campaign`, `campaign_payment`.
- **security:** tài khoản, vai trò, quyền hạn.
- **logging:** nhật ký hệ thống.

### 🧠 Business logic tiêu biểu

- Ràng buộc “mỗi hộ chỉ có 1 chủ hộ hoạt động”.
- Ngăn 1 người thuộc 2 hộ cùng lúc khi trạng thái đang ở.
- View/thống kê: dân cư theo trạng thái, tiến độ thu phí.

### 📑 Bảng chính (tóm tắt)

| Schema  | Table                | Mục đích chính               |
| ------- | -------------------- | ---------------------------- |
| core    | person               | Thông tin nhân khẩu          |
| core    | household            | Thông tin hộ khẩu            |
| core    | household_membership | Liên kết nhân khẩu ↔ hộ khẩu |
| core    | person_event         | Lưu biến động nhân khẩu      |
| core    | temp_permit          | Tạm trú, tạm vắng            |
| finance | fee_rate             | Biểu phí cố định             |
| finance | payment              | Ghi nhận thu phí vệ sinh     |
| finance | campaign             | Đợt quyên góp                |
| finance | campaign_payment     | Ghi nhận tiền đóng góp       |
