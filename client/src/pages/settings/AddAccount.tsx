"use client";

import { useState } from "react";
import { Save, Loader } from "lucide-react";

interface FormState {
  fullName: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  cccd: string;
  role: "admin" | "staff" | "viewer";
  status: "Hoạt động" | "Khóa";
}

export default function AddAccount() {
  const [form, setForm] = useState<FormState>({
    fullName: "",
    username: "",
    password: "123456",
    email: "",
    phone: "",
    cccd: "",
    role: "viewer",
    status: "Hoạt động",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.fullName.trim() || !form.username.trim()) return;
    setIsLoading(true);
    setSuccess(null);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    setSuccess("Đã tạo tài khoản nháp (mock). Tích hợp API để lưu thực tế.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-first dark:text-fourth">Thêm tài khoản mới</h2>
      </div>

      <div className="bg-white dark:bg-transparent dark:border dark:border-second/40 dark:backdrop-blur-md rounded-xl p-6 shadow-sm dark:shadow-none space-y-6">
        <p className="text-second dark:text-fourth/70 mb-6">
          Nhập thông tin tài khoản. Mật khẩu mặc định có thể thay đổi sau khi người dùng đăng nhập lần đầu.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Họ và tên" value={form.fullName} required onChange={(v) => update("fullName", v)} />
          <Field label="Username" value={form.username} required onChange={(v) => update("username", v)} />
          <Field label="Mật khẩu mặc định" value={form.password} onChange={(v) => update("password", v)} />
          <Field label="Email" value={form.email} onChange={(v) => update("email", v)} />
          <Field label="Số điện thoại" value={form.phone} onChange={(v) => update("phone", v)} />
          <Field label="CCCD" value={form.cccd} onChange={(v) => update("cccd", v)} />

          <div>
            <label className="block text-sm font-medium text-first dark:text-fourth mb-1">Vai trò</label>
            <select
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-second/40 dark:border-second/30 bg-white dark:bg-transparent text-first dark:text-fourth focus:outline-none focus:ring-2 focus:ring-third"
            >
              <option value="admin">Quản trị viên</option>
              <option value="staff">Nhân viên</option>
              <option value="viewer">Xem</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-first dark:text-fourth mb-1">Trạng thái</label>
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-second/40 dark:border-second/30 bg-white dark:bg-transparent text-first dark:text-fourth focus:outline-none focus:ring-2 focus:ring-third"
            >
              <option value="Hoạt động">Hoạt động</option>
              <option value="Khóa">Khóa</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !form.fullName.trim() || !form.username.trim()}
            className="w-full md:w-fit px-5 py-2 rounded-lg bg-third text-first hover:bg-third/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Tạo tài khoản
          </button>
          {success && <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-first dark:text-fourth mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-second/40 dark:border-second/30 bg-white dark:bg-transparent text-first dark:text-fourth focus:outline-none focus:ring-2 focus:ring-third"
      />
    </div>
  );
}
