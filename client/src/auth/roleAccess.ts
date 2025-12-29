// src/auth/roleAccess.ts
export type Role = "admin" | "staff";

export function isStaffAllowed(pathname: string) {
  // Dashboard (cho cả "/" nếu bạn có redirect về dashboard)
  if (pathname === "/" || pathname === "/dashboard") return true;

  // Profile (cho staff xem thông tin cá nhân)
    if (pathname === "/profile") return true;

  // Tất cả trang fee
  if (pathname === "/fees" || pathname.startsWith("/fees/")) return true;

  return false;
}
