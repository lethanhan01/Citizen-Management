"use client";

import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import heroGif from "@/assets/lakhe2.gif";

export default function App() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-fourth dark:bg-first px-6">

      {/* Nút đổi theme */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      {/* Hình động */}
      <img
        src={heroGif}
        alt="Citizen Management System illustration"
        className="w-full max-w-3xl rounded-2xl shadow-2xl mb-10 border border-second/30"
      />

      {/* Tiêu đề */}
      <h1 className="text-3xl font-bold text-first dark:text-darkmodetext mb-8">
        Citizen Management System
      </h1>

      {/* Nút đi tới hệ thống */}
      <button
        onClick={() => navigate("/login")}
        className="
          px-8 py-4 rounded-xl font-semibold text-lg
          bg-first text-darkmodetext 
          dark:bg-third dark:text-first
          shadow-md hover:shadow-lg active:scale-95
          transition
        "
      >
        Đi tới hệ thống quản lý dân cư
      </button>
    </div>
  );
}





