import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { isStaffAllowed } from "@/auth/roleAccess";

export default function RequireAuth() {
  const location = useLocation();
  const { token, user, fetchMe } = useAuthStore();
  const tokenInStorage =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Nếu chưa có user nhưng có token → lấy thông tin user
  useEffect(() => {
    if (token && !user) {
      fetchMe();
    }
  }, [token, user, fetchMe]);

  // Chưa đăng nhập (không có token ở store và cũng không có trong storage)
  if (!token && !tokenInStorage) {
    return <Navigate to="/login" replace />;
  }

  // Có token trong storage nhưng store chưa hydrate kịp
  // Tránh redirect sớm gây kẹt ở trang /login
  if (!token && tokenInStorage) {
    return <Outlet />;
  }

  // ĐÃ CÓ token trong store, nhưng user chưa kịp fetch xong -> cho qua, đừng redirect theo role vội
  if (token && !user) {
    return <Outlet />;
  }

  // ====== CHẶN ROLE STAFF Ở ĐÂY ======
  // staff chỉ được vào dashboard + tất cả trang /fees
  if (user?.role === "staff" && !isStaffAllowed(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Đã đăng nhập + hợp lệ quyền
  return <Outlet />;
}
