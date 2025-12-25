import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

export default function RequireAuth() {
  const { token, user, fetchMe } = useAuthStore();
  const tokenInStorage = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

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
    // Gọi fetchMe nếu cần, sau đó cho qua để router mount
    // (useEffect ở trên sẽ tự gọi fetchMe khi token có)
    return <Outlet />;
  }

  // Đã đăng nhập
  return <Outlet />;
}
