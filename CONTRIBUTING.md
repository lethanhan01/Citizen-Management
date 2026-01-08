# Hướng dẫn đóng góp

Cảm ơn bạn đã quan tâm tới dự án **Citizen Management**. Tài liệu này giúp bạn gửi đóng góp nhanh, gọn và nhất quán.

## Chuẩn bị môi trường
- Cài **Node.js** (khuyến nghị >= 18) và **npm**.
- Backend: `cd server && npm install`
- Frontend: `cd client && npm install`
- Frontend cần file `.env` trong `client/`:
  ```bash
  VITE_API_URL=http://localhost:5000
  ```

## Quy trình đóng góp
1. Fork repository hoặc tạo nhánh mới từ `main` (ví dụ: `feature/<ten-chuc-nang>` hoặc `fix/<ten-loi>`).
2. Thực hiện thay đổi nhỏ, có mục tiêu rõ ràng.
3. Commit ngắn gọn, dùng tiền tố quen thuộc (`feat:`, `fix:`, `docs:`, `chore:`...).
4. Mở Pull Request (PR) mô tả:
   - Vấn đề bạn giải quyết.
   - Thay đổi chính.
   - Cách kiểm thử.

## Kiểm tra trước khi gửi PR
- **Frontend**
  - `npm run lint` (đảm bảo format/ESLint cho mã nguồn client).
  - `npm run build` để chắc chắn dự án build thành công.
- **Backend**
  - Chưa có bộ test tự động; hãy tự kiểm tra luồng bạn thay đổi bằng cách chạy server (`npm run dev`) và thử API liên quan.
- Không commit `node_modules`, thư mục `dist`, hay file môi trường `.env`.

## Nguyên tắc code
- Ưu tiên **TypeScript**, giữ kiểu rõ ràng cho props, API response, store.
- Tuân thủ ESLint + Prettier (đã cấu hình sẵn trong dự án).
- Viết hàm nhỏ, dễ đọc; đặt tên biến rõ nghĩa.
- Cập nhật hoặc bổ sung tài liệu nếu thay đổi hành vi người dùng/API.

## Báo lỗi / đề xuất tính năng
- Mô tả ngắn gọn vấn đề, bước tái hiện, log (nếu có) và kỳ vọng.
- Với tính năng mới, nêu lý do và giá trị mang lại cho người dùng.

Cảm ơn bạn đã đóng góp để hệ thống quản lý dân cư ngày càng tốt hơn!
