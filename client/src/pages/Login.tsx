"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import icon from "@/assets/icon.svg";
import icon2 from "@/assets/icon2.svg";
import icon4 from "@/assets/icon4.svg";
import roundShapeLight from "@/assets/round-shape-light.svg";
import roundShapeBlue from "@/assets/round-shape.svg";
import { useEffect } from "react";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.username !== "admin" || form.password !== "inprogress") {
      setError("Tên đăng nhập hoặc mật khẩu sai!");
      return;
    }
    localStorage.setItem("token", "fake-token");

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-[clamp(1rem,5vw,2rem)] bg-blueblue dark:bg-darkblue overflow-x-hidden overflow-y-hidden">
      {/* Rotating Icon - Upper Left (hidden on mobile) */}
      <div className="absolute top-4 sm:top-8 -left-8 sm:-left-8 z-30 hidden sm:block">
        <img src={icon} alt="Icon" className="w-[clamp(40px,15vw,280px)] h-[clamp(40px,15vw,280px)] rotate-38 text-first dark:text-fourth opacity-100" />
      </div>
      {/* Icon 2 - Upper Right (responsive sizing) */}
       <div className="absolute top-[15%] -right-32 sm:top-[20%] sm:-right-30 z-20 hidden sm:block">
         <img src={icon2} alt="Icon 2" className="w-[clamp(40px,20vw,360px)] h-[clamp(40px,20vw,360px)] -rotate-30 opacity-100" />
       </div>
       {/* Icon 4 (hidden on mobile, repositioned on tablet+) */}
       <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-30 hidden sm:block">
         <img src={icon4} alt="Icon 4" className="w-[clamp(40px,12vw,260px)] h-[clamp(40px,12vw,260px)] rotate-12 opacity-100" />
       </div>
      {/* Background round shape (responsive scaling with vw) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <img src={roundShapeLight} alt="" className="w-[clamp(300px,100vw,1400px)] h-[clamp(300px,100vw,1400px)] opacity-100 block dark:hidden" />
        <img src={roundShapeBlue} alt="" className="w-[clamp(300px,100vw,1400px)] h-[clamp(300px,100vw,1400px)] opacity-100 hidden dark:block" />
      </div>
      {/* Theme Toggle */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="flex w-full justify-center items-center relative z-10">
        {/* FORM */}
        <div className="w-[clamp(280px,90vw,420px)] text-left rounded-2xl p-[clamp(1.5rem,4vw,2.5rem)] border-transparent shadow-lg bg-white dark:bg-white dark:text-darkblue backdrop-blur-md">

          <p className="font-bold mb-4" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>
            Đăng nhập hệ thống
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Username */}
            <div>
              <label className="block mb-2 text-[clamp(0.8rem,2vw,0.95rem)] font-medium">
                Tên đăng nhập
              </label>
              <input
                type="text"
                className="input-theme w-full rounded-lg p-[clamp(0.6rem,2vw,0.75rem)] placeholder:text-primary/50"
                placeholder="Nhập tên đăng nhập"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 text-[clamp(0.8rem,2vw,0.95rem)] font-medium">
                Mật khẩu
              </label>
              <input
                type="password"
                className="input-theme w-full rounded-lg p-[clamp(0.6rem,2vw,0.75rem)] placeholder:text-primary/50"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>

            {error && (
              <p className="text-red-500 text-[clamp(0.75rem,1.5vw,0.9rem)] font-medium text-center">
                {error}
              </p>
            )}

            {/* BUTTON SUBMIT */}
            <button
              type="submit"
              className="btn-theme w-full font-semibold rounded-lg text-[clamp(0.8rem,2vw,0.95rem)] px-[clamp(1rem,3vw,1.5rem)] py-[clamp(0.6rem,2vw,0.75rem)] transition"
            >
              Đăng nhập
            </button>

            <p className="text-[clamp(0.7rem,1.5vw,0.85rem)] text-muted-foreground dark:text-darkblue text-center pt-2">
              Quên mật khẩu?{" "}
              <span className="text-primary cursor-pointer hover:underline">
                Liên hệ tổ trưởng
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}





