"use client";

import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import SpotlightCard from "@/components/SpotlightCard";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-fourth dark:bg-first px-6">
      
      {/* Nút đổi theme */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      {/* Tiêu đề và nút với Spotlight Card */}
      <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
        <div className="flex flex-col items-center justify-center gap-8">
          <h1 className="text-3xl font-bold text-first dark:text-fourth">
            Citizen Management System
          </h1>

          <button
          onClick={() => navigate("/login")}
          className="
            px-8 py-4 rounded-xl font-semibold text-lg
            bg-first text-fourth 
            dark:bg-third dark:text-first
            shadow-md hover:shadow-lg active:scale-95
            transition
          "
        >
          Đi tới hệ thống quản lý dân cư
        </button>
        </div>
      </SpotlightCard>
    </div>
  );
}
