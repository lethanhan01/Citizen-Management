## 02_Design/architecture.md

### 🧩 Phân lớp hệ thống

```
React (Client)
   ↓ REST API
Express (Server)
   ↓
PostgreSQL (Database)
```

* Kiến trúc **3-tier** tách biệt UI, logic, và dữ liệu.
* API RESTful, JWT Authentication, RBAC authorization.

### 🗃 Schema thiết kế trong PostgreSQL

* **core:** nhân khẩu, hộ khẩu, biến động, tạm trú.
* **finance:** thu phí, đóng góp.
* **security:** tài khoản, vai trò, quyền hạn.
* **logging:** nhật ký hệ thống.

### 🧠 Business logic tiêu biểu

* Trigger đảm bảo “chỉ có 1 chủ hộ duy nhất đang hoạt động”.
* Trigger ngăn chặn 1 người ở 2 hộ cùng lúc.
* View tính thống kê dân cư và trạng thái thu phí.

---

## 02_Design/database_design/explanation.md

Tổng hợp các bảng chính trong **schema core** và **finance**:

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

---
