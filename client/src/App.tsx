"use client";

import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

export default function App() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-fourth dark:bg-first px-6">
      
      {/* Nút đổi theme */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

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





