"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useTheme } from '@/context/ThemeProvider';

// Mini theme toggle với icon
function MiniThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="
        mt-8 mx-auto block
        w-12 h-12 rounded-full
        bg-primary text-primary-foreground
        flex items-center justify-center
        shadow-md hover:shadow-lg hover:bg-primary/90
        transition active:scale-95 font-bold
      "
      aria-label="Chuyển đổi chế độ sáng/tối"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
}

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.username !== "admin" || form.password !== "inprogress") {
      setError("Tên đăng nhập hoặc mật khẩu sai!");
      return;
    }

    navigate("/dashboard");
  };

  return (
    <section className="bg-background min-h-screen flex items-center justify-center px-6 py-8">
      <div className="flex flex-col w-full items-center">

        
        <a className="flex items-center mb-6 text-2xl font-semibold text-foreground">
          Hệ thống quản lý nhân khẩu
        </a>

        {/* FORM */}
<div className="w-[380px] text-left rounded-2xl p-8 border border-border shadow-lg bg-card text-card-foreground backdrop-blur-md">

          <p className="font-bold text-foreground mb-4" style={{ fontSize: '1.5rem' }}>
            Đăng nhập hệ thống
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Username */}
            <div>
              <label className="block mb-2 text-sm font-medium text-foreground">
                Tên đăng nhập
              </label>
              <input
                type="text"
                className="input-theme w-full rounded-lg p-2.5 placeholder:text-muted-foreground"
                placeholder="Nhập tên đăng nhập"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 text-sm font-medium text-foreground">
                Mật khẩu
              </label>
              <input
                type="password"
                className="input-theme w-full rounded-lg p-2.5 placeholder:text-muted-foreground"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium text-center">
                {error}
              </p>
            )}

            {/* BUTTON SUBMIT */}
            <button
              type="submit"
              className="btn-theme w-full font-semibold rounded-lg text-sm px-5 py-2.5 transition"
            >
              Đăng nhập
            </button>

            <p className="text-sm text-muted-foreground text-center pt-2">
              Quên mật khẩu?{" "}
              <span className="text-primary cursor-pointer hover:underline">
                Liên hệ tổ trưởng
              </span>
            </p>
          </form>
        </div>

        {/* MINI THEME TOGGLE */}
        <MiniThemeToggle />
      </div>
    </section>
  );
}





