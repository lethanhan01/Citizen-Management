"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, Search, User, LogOut } from "lucide-react";

interface TopBarProps {
  onSearch?: (query: string) => void;
  userInitial?: string;
}

export default function TopBar({
  onSearch,
  userInitial = "A",
}: TopBarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();


  // Get page title from route
  const getPageTitle = () => {
    const path = location.pathname;
    const titleMap: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/citizens": "Danh sách công dân",
      "/households": "Danh sách hộ khẩu",
      "/services/temp-residence": "Đăng ký tạm trú",
      "/services/temp-absence": "Đăng ký tạm vắng",
      "/services/add-new-arrival": "Thêm nhân khẩu - Mới đến",
      "/services/add-newborn": "Thêm nhân khẩu - Mới sinh",
      "/services/update-person": "Thay đổi nhân khẩu",
      "/services/split-household": "Tách hộ khẩu",
      "/services/merge-household": "Nhập hộ khẩu",
      "/services/change-owner": "Thay đổi chủ hộ",
      "/services/household-history": "Lịch sử hộ khẩu",
      "/fees/fixed": "Khoản thu cố định",
      "/fees/donations": "Chiến dịch quyên góp",
      "/settings/accounts": "Danh sách tài khoản",
      "/settings/add-account": "Thêm tài khoản",
      "/profile": "Thông tin tài khoản",
    };
    
    // Check for dynamic routes
    if (path.startsWith("/citizens/")) return "Chi tiết công dân";
    if (path.startsWith("/households/")) return "Chi tiết hộ khẩu";
    
    return titleMap[path] || "Dashboard";
  };

  const handleLogout = () => {
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 px-8 bg-white dark:bg-transparent dark:backdrop-blur-md shadow-sm flex items-center justify-between relative z-40">

      <h1 className="text-xl leading-tight font-bold text-first dark:text-fourth !text-base !leading-tight">
        {getPageTitle()}
      </h1>

      {/* RIGHT – SEARCH + BELL + AVATAR */}
      <div className="flex items-center gap-6">
        {/* SEARCH BAR */}
        <div className="relative">
          <input
            className="
              pl-10 pr-4 py-2 rounded-lg text-sm w-56
              bg-second/10 dark:bg-second/20
              border border-second/40 dark:border-second/30
              text-first dark:text-fourth
              placeholder:text-second dark:placeholder:text-fourth/40
              focus:outline-none focus:ring-1 focus:ring-third transition
            "
            placeholder="Tìm kiếm..."
            onChange={(e) => onSearch?.(e.target.value)}
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-second dark:text-fourth/60" />
        </div>

        {/* NOTIFICATION */}
        <button className="relative p-2 rounded-lg hover:bg-second/20 dark:hover:bg-second/30 transition">
          <Bell className="w-5 h-5 text-first dark:text-fourth" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* USER AVATAR WITH DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="luxury-button relative w-10 h-10 rounded-full bg-gradient-to-br from-third to-third/80 text-first font-bold flex items-center justify-center cursor-pointer"
          >
            <div className="hover-bg" />
            <span className="button-text">{userInitial}</span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-first border border-second/40 dark:border-second/30 rounded-lg shadow-lg py-2 z-50">
              <button
                onClick={() => {
                  navigate("/profile");
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-first dark:text-fourth hover:text-blue-500 dark:hover:text-black  transition flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Thông tin tài khoản
              </button>
              <hr className="my-1 border-second/20 dark:border-second/30" />
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-black hover:text-red-500 dark:hover:text-black  transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
