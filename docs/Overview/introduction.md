## 00_Overview/introduction.md

### 🎯 Mục tiêu

Phần mềm **Quản lý thông tin dân cư (Citizen Management System)** giúp Ban quản lý Tổ dân phố 7 quản lý tập trung toàn bộ thông tin về:

* Nhân khẩu – hộ khẩu.
* Biến động dân cư (tạm trú, tạm vắng, chuyển đến, qua đời…).
* Thu phí, đóng góp.
* Thống kê và báo cáo nhanh, chính xác.

### 👥 Quy mô hệ thống

* ~400 hộ, ~1.700 nhân khẩu, nhiều sinh viên thuê trọ và hộ kinh doanh.
* Nhiều cấp người dùng: Tổ trưởng, tổ phó, kế toán, cán bộ dân cư.
* Dữ liệu thay đổi thường xuyên, yêu cầu hệ thống ổn định, dễ tra cứu.

### 🧱 Kiến trúc tổng thể

Hệ thống áp dụng mô hình **client–server**:

* **Frontend (React):** giao diện web.
* **Backend (NodeJS/Express):** API nghiệp vụ, xác thực.
* **Database (PostgreSQL):** nhiều schema chuyên biệt (core, finance, security, logging).
