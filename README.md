# 🏙️ Citizen Management System

![NodeJS](https://img.shields.io/badge/Backend-Node.js-green?logo=node.js)
![React](https://img.shields.io/badge/Frontend-React-blue?logo=react)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-yellow)
![LastCommit](https://img.shields.io/github/last-commit/lethanhan01/Citizen-Management?logo=github)

Ứng dụng web giúp Ban quản lý tổ dân phố quản lý **hộ khẩu, nhân khẩu, biến động, tạm trú – tạm vắng, thu phí và các khoản đóng góp** một cách **tập trung và hiệu quả**.

---

## 🧱 Công nghệ sử dụng

**Frontend:**
- React (Vite)
- TypeScript
- Tailwind CSS
- Axios, React Router
- State management (stores trong `client/src/stores`)

**Backend:**
- Node.js + Express
- PostgreSQL
- Sequelize (ORM)
- CORS, dotenv, nodemon
- JWT xác thực

## Demo Project
[![Xem demo trên YouTube](https://img.youtube.com/vi/L2Wl6m0teB8/maxresdefault.jpg)](https://www.youtube.com/watch?v=L2Wl6m0teB8 "Bấm để xem trên YouTube")


## ⚙️ Cài đặt và chạy dự án

### 1️⃣ Clone project
```bash
git clone https://github.com/lethanhan01/Citizen-Management.git
cd Citizen-Management
````

### 2️⃣ Cài đặt dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

---

### 3️⃣ Cấu hình môi trường và chạy ở chế độ phát triển

Tạo file `.env` trong thư mục `client/` như sau:

```bash
VITE_API_URL=https://citizen-management-w0w5.onrender.com
```

Chạy chương trình:
```bash
cd ./client
npm run dev
```
---

### 5️⃣ Build & deploy

#### 🖥️ Build Frontend

```bash
cd client
npm run build
```
#### ☁️ Deploy Backend
Deploy trên **Render**, **Railway**, hoặc **AWS EC2** (PostgreSQL dùng RDS, Supabase hoặc ElephantSQL).

Tuy nhiên
cả Frontend và Backend đều đã được Lê Thành An deploy rồi nên có thể bỏ qua bước này và ấn vào link ở phần mô tả để xem kết quả

---

## 📜 Scripts

### Frontend (client/package.json)
- `npm run dev`: Chạy Vite dev server
- `npm run build`: Build sản phẩm
- `npm run preview`: Xem thử bản build

### Backend (server/package.json)
- `npm run dev`: Chạy server với nodemon
- `npm run start`: Chạy server production

---

## ⚡ Lưu ý khi phát triển

* **Kiểm tra kiểu TypeScript** bằng lệnh:

  ```bash
  npx tsc --noEmit
  ```
* **Cấu hình proxy** trong `client/vite.config.ts` (nếu cần tránh CORS):

  ```ts
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'

  export default defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': 'http://localhost:5000'
      }
    }
  })
  ```
---

## 🚀 Chất lượng Code (Code Quality)

Dự án sử dụng **TypeScript**, **ESLint** và **Prettier** để đảm bảo code thống nhất và sạch sẽ.

Bạn có thể kiểm tra/lint/format tùy theo scripts được cấu hình trong từng package:

```bash
# Ví dụ ở frontend
cd client
npm run lint
npm run format
```

## 👨‍💻 Tác giả

**Lê Thành An**

🎓 Hanoi University of Science and Technology (HUST)

📧 [An.LT235631@sis.hust.edu.vn](mailto:An.LT235631@sis.hust.edu.vn)

🌐 [github.com/lethanhan01](https://github.com/lethanhan01)

---

## 📄 Giấy phép

Dự án phát hành theo **MIT License** — bạn có thể tự do sử dụng và phát triển thêm.

---

> ❤️ *“Công nghệ phục vụ cộng đồng — quản lý dân cư dễ dàng, minh bạch, và chính xác.”*

