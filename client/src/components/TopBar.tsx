"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, User, LogOut, X } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

interface Notification {
  id: string;
  message: string;
  date: string;
  isRead: boolean;
}

interface TopBarProps {
  userInitial?: string;
}

export default function TopBar({
  userInitial = "A",
}: TopBarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      message: "Chào mừng đến với hệ thống quản lý nhân khẩu phường La Khê!",
      date: new Date().toISOString().split("T")[0],
      isRead: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;


  // Get page title from route
  const getPageTitle = () => {
    const path = location.pathname;
    const titleMap: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/citizens": "Danh sách công dân",
      "/households": "Danh sách hộ khẩu",
      "/services/temp-residence": "Đăng ký tạm trú",
      "/services/temp-absence": "Đăng ký tạm vắng",
      "/services/add-new-arrival": "Thêm nhân khẩu - Đăng kí thường trú",
      "/services/add-newborn": "Thêm nhân khẩu - Mới sinh",
      "/services/update-person": "Thay đổi nhân khẩu",
      "/services/household/split": "Tách hộ khẩu",
      "/services/household/change-owner": "Thay đổi chủ hộ",
      "/services/household/history": "Lịch sử hộ khẩu",
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
    // Sử dụng store để đảm bảo reset state + redirect thống nhất
    logout();
    navigate('/login', { replace: true });
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 px-8 bg-(--sidebar-bg-light) dark:bg-white/3 dark:backdrop-blur-md shadow-sm flex items-center justify-between relative z-40">

      <h1 className="font-bold text-first dark:text-darkmodetext text-base! leading-tight!">
        {getPageTitle()}
      </h1>

      {/* RIGHT – BELL + AVATAR */}
      <div className="flex items-center gap-6">
        {/* NOTIFICATION */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-second/20 dark:hover:bg-second/30 transition"
          >
            <Bell className="w-5 h-5 text-first dark:text-darkmodetext" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-darkblue rounded-full dark:bg-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-card text-card-foreground border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold text-first dark:text-darkmodetext">
                  Thông báo {unreadCount > 0 && `(${unreadCount})`}
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Đánh dấu tất cả đã đọc
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 rounded hover:bg-second/10 dark:hover:bg-second/20"
                  >
                    <X className="w-4 h-4 text-first dark:text-darkmodetext" />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-second dark:text-darkmodetext/70">
                    Không có thông báo nào
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-4 border-b border-border last:border-b-0 cursor-pointer transition ${
                        notif.isRead
                          ? "bg-transparent"
                          : "bg-blue-50 dark:bg-blue-900/10"
                      } hover:bg-second/5 dark:hover:bg-second/10`}
                    >
                      <p className="text-sm text-first dark:text-darkmodetext mb-1">
                        {notif.message}
                      </p>
                      <p className="text-xs text-second dark:text-darkmodetext/70">
                        {notif.date}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* USER AVATAR WITH DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="luxury-button relative w-10 h-10 rounded-full text-darkblue dark:text-white font-bold flex items-center justify-center cursor-pointer transition"
          >
            <div className="hover-bg" />
            <span className="button-text">{userInitial}</span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-card text-card-foreground border border-border rounded-lg shadow-lg py-2 z-50">
              <button
                onClick={() => {
                  navigate("/profile");
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-first dark:text-darkmodetext hover:text-blue-500 transition flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Thông tin tài khoản
              </button>
              <hr className="my-1 border-second/20 dark:border-second/30" />
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm hover:text-red-500 dark:hover:text-red-500 transition flex items-center gap-2"
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





