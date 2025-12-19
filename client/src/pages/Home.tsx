"use client";

import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import icon from "@/assets/icon.svg";
import icon2 from "@/assets/icon2.svg";
import icon4 from "@/assets/icon4.svg";
import roundShapeLight from "@/assets/round-shape-light.svg";
import roundShapeBlue from "@/assets/round-shape.svg";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-[clamp(1rem,5vw,2rem)] bg-blueblue dark:bg-darkblue overflow-x-hidden overflow-y-hidden">
      {/* Rotating Icon - Upper Left */}
      <div className="absolute top-4 sm:top-8 -left-8 z-30 hidden sm:block">
        <img src={icon} alt="Icon" className="w-[clamp(40px,15vw,280px)] h-[clamp(40px,15vw,280px)] rotate-38 text-first dark:text-fourth opacity-100" />
      </div>
       {/* Icon 2 - Upper Right */}
       <div className="absolute top-[15%] -right-32 sm:top-[20%] sm:-right-30 z-20 hidden sm:block">
         <img src={icon2} alt="Icon 2" className="w-[clamp(40px,20vw,360px)] h-[clamp(40px,20vw,360px)] -rotate-30 opacity-100" />
       </div>
      
       {/* Icon 4 - Centered horizontally, lower area */}
       <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-30 hidden sm:block">
         <img src={icon4} alt="Icon 4" className="w-[clamp(40px,12vw,260px)] h-[clamp(40px,12vw,260px)] rotate-12 opacity-100" />
       </div>

      {/* Background round shape */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <img src={roundShapeLight} alt="" className="w-[clamp(300px,100vw,1400px)] h-[clamp(300px,100vw,1400px)] opacity-100 block dark:hidden" />
        <img src={roundShapeBlue} alt="" className="w-[clamp(300px,100vw,1400px)] h-[clamp(300px,100vw,1400px)] opacity-100 hidden dark:block" />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8">
        <h1
          className="text-center text-darkblue dark:text-white"
          style={{
            fontFamily: "BigShouldersDisplay, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(3.6rem, 7.4vw, 7.4rem)",
            lineHeight: 1.05,
          }}
        >
          <span className="block">LA KHE WARD</span>
          <span className="block">CITIZEN MANAGEMENT SYSTEM</span>
        </h1>

        <button
          onClick={() => navigate("/login")}
          aria-label="Đi tới hệ thống quản lý dân cư"
          className="
              px-[clamp(0.8rem,3vw,1.5rem)] py-[clamp(0.5rem,1.5vw,0.8rem)] rounded-full font-semibold text-[clamp(0.9rem,2.5vw,1.5rem)]
              bg-transparent  
              text-darkblue dark:text-white 
              ring-2 ring-darkblue/30 dark:ring-white/40
              hover:ring-4 hover:ring-darkblue dark:hover:ring-white active:scale-95
              transition
              flex items-center justify-center gap-2
            "
        >
          Get Started
          <ArrowRight className="h-[clamp(0.9rem,2.5vw,1.5rem)] w-[clamp(0.9rem,2.5vw,1.5rem)] -mr-[clamp(0.2rem,0.6vw,0.3rem)]" />
        </button>
      </div>
    </div>
  );
}





