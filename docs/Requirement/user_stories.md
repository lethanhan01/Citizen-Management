## 01_Requirements/user_stories.md

### Đăng nhập & phân quyền
- Là quản trị viên, tôi muốn đăng nhập bằng tài khoản để truy cập trang quản trị, nhằm quản lý người dùng và vai trò.
- Là cán bộ, tôi muốn được gán vai trò (staff) để truy cập các chức năng nhập liệu dân cư.
- Điều kiện chấp nhận: nhận token JWT sau đăng nhập; truy cập bị chặn nếu không có/không hợp lệ; vai trò quyết định hiển thị menu/chức năng.

### Quản lý hộ khẩu
- Là cán bộ, tôi muốn tạo mới hộ khẩu với địa chỉ và gán chủ hộ, để khởi tạo hồ sơ cư trú.
- Là cán bộ, tôi muốn thêm/xóa/cập nhật thành viên hộ, để hồ sơ hộ khẩu phản ánh đúng tình trạng hiện tại.
- Điều kiện chấp nhận: ràng buộc chỉ có một chủ hộ hoạt động; không cho phép một người đồng thời thuộc hai hộ.

### Quản lý nhân khẩu & biến động
- Là cán bộ, tôi muốn ghi nhận biến động (sinh/mất/chuyển đi/đến), để lịch sử cư trú được lưu trữ.
- Là cán bộ, tôi muốn cấp/tắt tạm trú–tạm vắng, để theo dõi trạng thái cư trú tạm thời.
- Điều kiện chấp nhận: dữ liệu cập nhật xuất hiện trong lịch sử và ảnh hưởng thống kê.

### Thu phí & chiến dịch đóng góp
- Là kế toán, tôi muốn ghi nhận phí vệ sinh theo tháng/năm, để tính toán công nợ chính xác.
- Là kế toán, tôi muốn tạo chiến dịch đóng góp và ghi nhận khoản đóng, để tổng hợp kết quả chiến dịch.
- Điều kiện chấp nhận: báo cáo Excel xuất ra đúng số liệu; trạng thái nộp/thiếu được thống kê theo hộ.

### Tìm kiếm, phân trang, lọc
- Là người dùng, tôi muốn tìm kiếm theo họ tên/CCCD/địa chỉ, để nhanh chóng tra cứu hồ sơ.
- Là người dùng, tôi muốn phân trang và lọc theo tham số URL, để chia sẻ đường dẫn và giữ trạng thái.
- Điều kiện chấp nhận: API trả về kết quả đúng với bộ lọc; hiệu năng đáp ứng với dữ liệu hiện có.

### Thống kê
- Là tổ trưởng, tôi muốn xem thống kê theo giới tính/độ tuổi/tình trạng cư trú, để nắm tình hình nhân khẩu.
- Là kế toán, tôi muốn xem tiến độ thu phí theo hộ, để đôn đốc các hộ còn thiếu.
- Điều kiện chấp nhận: biểu đồ/bảng số liệu trùng khớp với dữ liệu nguồn.

### Lịch tác vụ (Scheduler)
- Là hệ thống, tôi muốn tự động kiểm tra các hồ sơ tạm vắng hết hạn lúc 00:01 mỗi ngày, để khôi phục trạng thái cư trú thường trú.
- Điều kiện chấp nhận: log ghi nhận lần chạy; trạng thái được cập nhật đúng quy tắc.
