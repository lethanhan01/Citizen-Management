export type Role = "admin" | "viewer" | "staff";
export type Status = "Hoạt động" | "Khóa";

export interface Account {
  id: string;
  fullName: string;
  username: string;
  role: Role;
  status: Status;
  createdAt: string;
  email?: string;
  phone?: string;
  cccd?: string;
  password?: string; // chỉ dùng cho form, không nên lấy từ BE
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Quản trị viên",
  viewer: "Xem",
  staff: "Nhân viên",
};
