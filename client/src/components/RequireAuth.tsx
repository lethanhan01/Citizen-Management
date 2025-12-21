import { Navigate, Outlet } from "react-router-dom";

function getToken() {
  return localStorage.getItem("token");
}

export default function RequireAuth() {
  const token = getToken();

  //  Chưa đăng nhập
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  //  Đã đăng nhập
  return <Outlet />;
}
