## Hướng dẫn thiết lập & chạy (hiện tại)

### 1) Cài đặt dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2) Biến môi trường

- Backend (`server/.env`):

```env
PORT=5000
CORS_ALLOWED_ORIGINS=http://localhost:5173
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=your_database
DB_HOST=your_host
DB_PORT=5432
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

- Frontend (`client/.env.local` hoặc `client/.env`):

```env
VITE_API_URL=http://localhost:5000
```

### 3) Chạy chế độ phát triển

Mở hai terminal:

```bash
# Terminal 1: Backend
cd server
npm run dev
```

```bash
# Terminal 2: Frontend
cd client
npm run dev
```

Truy cập: FE http://localhost:5173, BE http://localhost:5000

### 4) Build & Preview Frontend

```bash
cd client
npm run build
npm run preview
```

### 5) Deploy Backend

- Render / Railway / AWS EC2. PostgreSQL dùng RDS hoặc Supabase/ElephantSQL.
- Bật SSL cho Sequelize/pg khi production (đã hỗ trợ trong cấu hình).

### 6) Ghi chú bổ sung

- FE dùng alias `@` (xem `client/vite.config.ts`).
- Interceptor axios gắn `Authorization` từ `localStorage.token`.
- Scheduler cron chạy 00:01 mỗi ngày (xem `server/src/services/schedulerService.js`).