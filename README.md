
# 🏙️ Citizen Management System

![NodeJS](https://img.shields.io/badge/Backend-Node.js-green?logo=node.js)
![React](https://img.shields.io/badge/Frontend-React-blue?logo=react)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Status](https://img.shields.io/badge/Build-Passing-brightgreen)
![LastCommit](https://img.shields.io/github/last-commit/lethanhan01/Citizen-Management?logo=github)

Ứng dụng web giúp Ban quản lý tổ dân phố quản lý **hộ khẩu, nhân khẩu, biến động, tạm trú – tạm vắng, thu phí và các khoản đóng góp** một cách **tập trung và hiệu quả**.

---

## 🧱 Công nghệ sử dụng

**Frontend:**
- React (Vite)
- TypeScript
- Axios, React Router

**Backend:**
- Node.js + Express
- PostgreSQL
- Sequelize (ORM)
- CORS, dotenv, nodemon

---

## 📁 Cấu trúc thư mục

```

Citizen-Management/
│
├── client/               # Frontend React
│   ├── src/
│   ├── vite.config.ts
│   └── package.json
│
├── server/               # Backend Node.js + Express
│   ├── index.js
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   └── package.json
│
├── package.json          # File gốc (chạy đồng thời client + server)
├── .env.example          # File mẫu biến môi trường
├── .gitignore
└── README.md

````

---

## ⚙️ Cài đặt và chạy dự án

### 1️⃣ Clone project
```bash
git clone https://github.com/lethanhan01/Citizen-Management.git
cd Citizen-Management
````

### 2️⃣ Cài đặt dependencies

```bash
# Cài ở thư mục gốc
npm install

# Cài backend
cd server
npm install

# Cài frontend
cd ../client
npm install
```

---

### 3️⃣ Cấu hình môi trường

Tạo file `.env` trong thư mục `server/` dựa theo `.env.example`:

```bash
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/citizen_db
JWT_SECRET=super_secret_key
```

---

### 4️⃣ Chạy ứng dụng ở chế độ phát triển

Tại thư mục gốc:

```bash
npm run dev
```

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend: [http://localhost:5000](http://localhost:5000)

---

### 5️⃣ Build & deploy

#### 🖥️ Build Frontend

```bash
cd client
npm run build
```

→ Tạo thư mục `client/dist/`

#### ☁️ Deploy Backend

Deploy trên **Render**, **Railway**, hoặc **AWS EC2** (PostgreSQL dùng RDS hoặc ElephantSQL).

---

## 🧩 API endpoints (ví dụ)

| Method | Endpoint              | Mô tả                           |
| ------ | --------------------- | ------------------------------- |
| GET    | `/api/households`     | Lấy danh sách hộ gia đình       |
| POST   | `/api/households`     | Tạo mới hộ                      |
| PUT    | `/api/households/:id` | Cập nhật hộ                     |
| DELETE | `/api/households/:id` | Xóa hộ                          |
| GET    | `/api/payments`       | Lấy danh sách đóng góp, thu phí |

---

## 📜 Scripts có sẵn

| Lệnh                         | Mục đích                        |
| ---------------------------- | ------------------------------- |
| `npm run dev`                | Chạy client + server song song  |
| `npm run start`              | Chạy server ở chế độ production |
| `cd client && npm run build` | Build frontend React            |
| `cd server && npm run dev`   | Chạy riêng backend              |

---

## ⚡ Lưu ý khi phát triển

* **Kiểm tra kiểu TypeScript** bằng lệnh:

  ```bash
  npx tsc --noEmit
  ```
* **Cấu hình proxy** trong `client/vite.config.js` (nếu cần tránh CORS):

  ```js
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
  ```
* **Không commit file `.env`**, chỉ giữ `.env.example`.

---

## 🚀 Chất lượng Code (Code Quality)

Dự án này sử dụng **ESLint** và **Prettier** để đảm bảo code thống nhất và sạch sẽ.

### Tự động hóa (Husky & lint-staged)

Khi bạn thực hiện `git commit`, **Husky** và **lint-staged** sẽ tự động chạy `eslint --fix` và `prettier --write` trên các file bạn đã thay đổi (staged files). Điều này đảm bảo code lỗi hoặc chưa format sẽ không được commit vào repository.

### Scripts thủ công

Bạn cũng có thể chạy các lệnh sau thủ công bất cứ lúc nào:

* `npm run lint`: Quét và tự động sửa lỗi ESLint cho toàn bộ thư mục `src`.
* `npm run format`: Tự động format code bằng Prettier cho toàn bộ dự án.

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

