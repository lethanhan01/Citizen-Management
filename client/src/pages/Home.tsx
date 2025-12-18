"use client";

import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import SpotlightCard from "@/components/SpotlightCard";
import heroGif from "@/assets/lakhe2.gif";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative flex flex-col items-center justify-center px-6"
      style={{
        backgroundImage: `url(${heroGif})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-first/70" aria-hidden="true" />

      {/* Nút đổi theme */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Tiêu đề và nút với Spotlight Card */}
      <SpotlightCard
        className="custom-spotlight-card z-10 w-full max-w-4xl"
        spotlightColor="rgba(0, 229, 255, 0.2)"
      >
        <h1 className="text-[35px] font-bold text-center align-middle text-first dark:text-fourth">
          Citizen Management System
        </h1>

        <div className="flex flex-col items-center justify-center gap-8">
          <button
            onClick={() => navigate("/login")}
            aria-label="Đi tới hệ thống quản lý dân cư"
            className="
                px-8 py-4 rounded-xl font-semibold text-lg
                bg-first text-fourth 
                dark:bg-third dark:text-first
                shadow-md hover:shadow-lg active:scale-95
                transition
              "
          >
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>
      </SpotlightCard>
    </div>
  );
}
