# Citizen Management – Frontend (React + TypeScript + Vite)

Ứng dụng Frontend cho hệ thống Quản lý Công dân, xây dựng bằng React 19, TypeScript và Vite. Dự án sử dụng TailwindCSS cho UI, React Router cho điều hướng, React Query cho quản lý dữ liệu bất đồng bộ, Axios cho HTTP client, và Zustand cho state nhẹ.

## Mục lục

- Tổng quan
- Kiến trúc & Công nghệ
- Cấu trúc thư mục
- Thiết lập môi trường
- Chạy dự án
- Biên dịch & Preview
- Quy ước mã nguồn
- Luồng xác thực & gọi API
- Gợi ý triển khai

## Tổng quan

Frontend đảm nhiệm các tính năng:

- Đăng nhập/đăng xuất, bảo vệ route theo vai trò.
- Quản lý công dân, hộ khẩu, phí dịch vụ, chiến dịch, thống kê.
- Tìm kiếm, phân trang, lọc theo tham số URL.
- Theme sáng/tối và UI components tái sử dụng.

## Kiến trúc & Công nghệ

- React 19 + TypeScript + Vite (rolldown-vite) cho dev/build nhanh.
- TailwindCSS v4 + `tailwindcss-animate`, `tailwind-merge` cho style tiện lợi.
- React Router v7 cho định tuyến SPA.
- React Query v5 cho caching/fetching dữ liệu.
- Axios cho HTTP client, interceptor xử lý token & lỗi.
- Zustand cho state management gọn nhẹ.
- ESLint + Prettier + Husky + lint-staged cho chất lượng code.

Tham khảo cấu hình alias `@` trong Vite tại [vite.config.ts](vite.config.ts).

## Cấu trúc thư mục

Các thư mục chính trong [client/src](src):

- [api](src/api): các wrapper gọi API (axios) theo domain.
- [auth](src/auth): logic kiểm soát quyền truy cập.
- [components](src/components): UI components tái sử dụng.
- [context](src/context): provider như theme.
- [hooks](src/hooks): custom hooks (ví dụ tham số danh sách công dân).
- [layouts](src/layouts): bố cục ứng dụng/public.
- [lib](src/lib): tiện ích chung (axios client, utils,...).
- [mappers](src/mappers): chuyển đổi dữ liệu từ API sang UI model.
- [pages](src/pages): trang chức năng (dashboard, citizens, fees,...).
- [routes](src/routes): định tuyến tổng.
- [stores](src/stores): Zustand stores (auth, fee, person,...).
- [styles](src/styles): CSS global.
- [types](src/types): định nghĩa kiểu dữ liệu.

### Sơ đồ thư mục client

```
client/
├─ public/
│  └─ _redirects
├─ src/
│  ├─ api/
│  ├─ auth/
│  ├─ components/
│  ├─ context/
│  ├─ hooks/
│  ├─ layouts/
│  ├─ lib/
│  │  ├─ axios.ts
│  │  ├─ citizen-ui.ts
│  │  └─ utils.ts
│  ├─ mappers/
│  ├─ pages/
│  │  ├─ citizens/
│  │  ├─ fees/
│  │  ├─ profile/
│  │  ├─ services/
│  │  └─ settings/
│  ├─ routes/
│  ├─ stores/
│  ├─ styles/
│  ├─ types/
│  ├─ assets/
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ index.css
├─ index.html
├─ vite.config.ts
├─ tailwind.config.cjs
├─ postcss.config.cjs
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.node.json
├─ eslint.config.js
├─ package.json
├─ vercel.json
└─ README.md
```

Ghi chú:
- Alias `@` trỏ tới [src](src); tham khảo cấu hình tại [vite.config.ts](vite.config.ts).
- Tài nguyên tĩnh nằm ở [public](public) (ví dụ [_redirects](public/_redirects)).
- Font/asset tuỳ chỉnh đặt trong [src/assets](src/assets) (ví dụ thư mục BIGSHOULDERSDISPLAY).
- Các tệp cấu hình chính: [tailwind.config.cjs](tailwind.config.cjs), [postcss.config.cjs](postcss.config.cjs), [eslint.config.js](eslint.config.js), [tsconfig.json](tsconfig.json), [vercel.json](vercel.json).
- Entry HTML: [index.html](index.html); entry app: [src/main.tsx](src/main.tsx) và [src/App.tsx](src/App.tsx).

## Thiết lập môi trường

1) Cài dependencies:

```bash
cd client
npm install
```

2) Biến môi trường (Vite):

- `VITE_API_URL`: Base URL cho API Backend.
- Mặc định nếu không set: `http://localhost:5000` (xem [src/lib/axios.ts](src/lib/axios.ts)).

Tạo file `.env.local` hoặc `.env` trong thư mục `client`:

```env
VITE_API_URL=https://citizen-management-w0w5.onrender.com
```

Lưu ý: Biến Vite chỉ khả dụng ở build-time, truy cập qua `import.meta.env`.

## Chạy dự án

Các script trong [client/package.json](package.json):

- `dev`: chạy Vite dev server.
- `build`: build TypeScript + bundle sản phẩm.
- `preview`: preview bản build.
- `lint`: chạy ESLint fix lỗi.
- `format`: chạy Prettier định dạng mã nguồn.

Phát triển:

```bash
npm run dev
```

Kiểm tra lint/format (tuỳ chọn):

```bash
npm run lint
npm run format
```

## Biên dịch & Preview

Build production:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

## Quy ước mã nguồn

- Sử dụng TypeScript, hạn chế `any`.
- Giữ UI thuần tuý trong components; nghiệp vụ nằm ở hooks/stores.
- API gọi qua module trong [src/api](src/api), tái sử dụng `apiClient`.
- Đặt state toàn cục trong [src/stores](src/stores) (Zustand).
- Routing khai báo tập trung trong [src/routes](src/routes).
- Dùng Tailwind utility-first, hạn chế style inline.

## Luồng xác thực & gọi API

- Token lưu trong `localStorage` dưới key `token`.
- Interceptor `request` tự gắn `Authorization: Bearer <token>` nếu có.
- Interceptor `response` chuẩn hoá lỗi và tự `logout` khi gặp 401.
- Base URL lấy từ `VITE_API_URL` (mặc định `http://localhost:5000`). Xem [src/lib/axios.ts](src/lib/axios.ts).

## Gợi ý triển khai

- Triển khai Frontend riêng (Vercel/Netlify) và trỏ `VITE_API_URL` về Backend.
- Kiểm soát truy cập trang bằng `RequireAuth` và cấu hình vai trò trong [src/auth/roleAccess.ts](src/auth/roleAccess.ts).
- Sử dụng React Query cho fetch/pagination/search để tận dụng cache.
- Tách mapper tại [src/mappers](src/mappers) để ổn định UI model khi API thay đổi.

---

Nếu cần thêm hướng dẫn cho Backend, xem thư mục `server/` ở root repo.
