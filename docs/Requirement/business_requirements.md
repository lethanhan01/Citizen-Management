## 01_Requirements/business_requirements.md

### 1️⃣ Quản lý hộ khẩu – nhân khẩu

* Thêm, cập nhật, xóa hộ khẩu.
* Quản lý thành viên hộ khẩu (quan hệ, thời gian sống trong hộ).
* Theo dõi biến động: sinh, mất, chuyển đi, tách hộ, thay đổi chủ hộ.
* Cấp giấy tạm trú, tạm vắng, tra cứu lịch sử.

### 2️⃣ Quản lý thu phí – đóng góp

* Thu phí bắt buộc: **Phí vệ sinh 6.000đ/người/tháng × 12 tháng.** (có thống kê tiến độ)
* Quản lý các đợt đóng góp tự nguyện (theo chiến dịch).
* Xuất báo cáo Excel (thu phí/đóng góp).
* Thống kê tổng thu, số hộ đã nộp, số hộ còn thiếu.

### 3️⃣ Quản lý người dùng – phân quyền

* Phân vai: tổ trưởng, tổ phó, kế toán, cán bộ dân cư.
* RBAC (Role-Based Access Control): truy cập theo chức năng; xác thực JWT.

### 4️⃣ Báo cáo – thống kê

* Theo giới tính, độ tuổi, tình trạng cư trú, thời gian.
* Kết xuất Excel (ưu tiên; PDF xem xét sau).

### 5️⃣ Tìm kiếm – phân trang – lọc

* Tìm kiếm theo họ tên, CMND/CCCD, địa chỉ.
* Phân trang, lọc theo tham số URL; tối ưu truy vấn.
