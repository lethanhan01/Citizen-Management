import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { isStaffAllowed } from "@/auth/roleAccess";
import AuthPopup from "@/components/AuthPopup";

export default function RequireAuth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user, fetchMe } = useAuthStore();
  const tokenInStorage =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  // Nếu chưa có user nhưng có token → lấy thông tin user
  useEffect(() => {
    if (token && !user) {
      fetchMe();
    }
  }, [token, user, fetchMe]);

  // Kiểm tra và hiển thị popup khi staff truy cập trang không được phép
  useEffect(() => {
    if (user?.role === "staff" && !isStaffAllowed(location.pathname)) {
      setShowAuthPopup(true);
    } else {
      setShowAuthPopup(false);
    }
  }, [user?.role, location.pathname]);

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
    return (
      <>
        {showAuthPopup && (
          <AuthPopup
            title="Không có quyền truy cập"
            message="Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn cần thêm quyền."
            actionLabel="Quay lại Dashboard"
            redirectPath="/dashboard"
            onClose={() => {
              setShowAuthPopup(false);
              navigate("/dashboard", { replace: true });
            }}
          />
        )}
      </>
    );
  }

  // Đã đăng nhập + hợp lệ quyền
  return <Outlet />;
}
