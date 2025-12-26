import axios from "@/lib/axios";

export type CreateUserPayload = {
  username: string;
  password: string;
  full_name: string;
  role?: string; // backend: mặc định accountant
};

export type UpdateUserPayload = Partial<{
  full_name: string;
  role: string;
  password: string; // reset password nếu cần
}>;

export const accountApi = {
  getAll: () => axios.get("/api/v1/get-all-users"),
  create: (data: CreateUserPayload) => axios.post("/api/v1/create-user", data),
  update: (id: string | number, data: UpdateUserPayload) =>
    axios.put(`/api/v1/update-user/${id}`, data),
  remove: (id: string | number) => axios.delete(`/api/v1/delete-user/${id}`),
};
