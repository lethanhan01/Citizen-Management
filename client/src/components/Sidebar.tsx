"use client";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  LayoutDashboard,
  Users,
  FileText,
  Home,
  HandCoins,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface SubMenuItem {
  label: string;
  href: string;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  submenu?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: "Công dân",
    submenu: [
      { label: "Xem công dân", href: "/citizens" },
      { label: "Xem hộ khẩu", href: "/households" },
    ],
  },
  {
    icon: <FileText className="w-5 h-5" />,
    label: "Dịch vụ dân cư",
    submenu: [
      { label: "Đăng ký tạm trú", href: "/services/temp-residence" },
      { label: "Đăng ký tạm vắng", href: "/services/temp-absence" },
      { label: "Đăng ký thường trú", href: "/services/add-new-arrival" },
      { label: "Thêm mới sinh", href: "/services/add-newborn" },
      { label: "Thay đổi nhân khẩu", href: "/services/update-person" },
    ],
  },
  {
    icon: <Home className="w-5 h-5" />,
    label: "Dịch vụ hộ khẩu",
    submenu: [
      { label: "Tách hộ", href: "/services/household/split" },
      { label: "Thay đổi chủ hộ", href: "/services/household/change-owner" },
      { label: "Lịch sử hộ", href: "/services/household/history" },
    ],
  },
  {
    icon: <HandCoins className="w-5 h-5" />,
    label: "Thu phí",
    submenu: [
      { label: "Khoản thu cố định", href: "/fees/fixed" },
      { label: "Chiến dịch quyên góp", href: "/fees/donations" },
    ],
  },
  {
    icon: <Settings className="w-5 h-5" />,
    label: "Cài đặt",
    submenu: [
      { label: "Danh sách tài khoản", href: "/settings/accounts" },
      { label: "Thêm tài khoản", href: "/settings/add-account" },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>(["Dashboard"]);
  const location = useLocation();

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  return (
    <aside
      className={`
        sticky top-0 h-screen max-h-screen transition-all duration-300
        bg-(--sidebar-bg-light) dark:bg-white/5 dark:backdrop-blur-md shadow-md flex flex-col flex-shrink-0 z-50
        ${collapsed ? "w-16" : "w-60"}
      `}
    >
      {/* Sidebar header - NOT scrollable */}
      <div className="h-16 flex items-center justify-between px-4 bg-inherit flex-shrink-0">
        {!collapsed && (
          <span className="text-lg font-semibold text-first dark:text-darkmodetext">
            Administrator
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 -ml-1.5 hover:bg-second/10 dark:hover:bg-second/30 rounded-3xl transition"
          aria-label="Toggle sidebar"
        >
          <Menu className="text-first dark:text-darkmodetext" />
        </button>
      </div>

      {/* MENU - scrollable only */}
      <nav className="sidebar-scroll mt-4 space-y-1 px-2 overflow-y-auto flex-1">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.label}
            item={item}
            collapsed={collapsed}
            isOpen={openMenus.includes(item.label)}
            onToggle={() => toggleMenu(item.label)}
            currentPath={location.pathname}
          />
        ))}
      </nav>
    </aside>
  );
}

// Parent Menu Button Component
function ParentMenuButton({
  icon,
  label,
  isOpen,
  collapsed,
  onClick,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  collapsed: boolean;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        sidebar-radio-item
        w-full flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer font-semibold
        text-first dark:text-darkmodetext ${active ? "is-active" : ""}
      `}
    >
      {icon}
      {!collapsed && (
        <>
          <span className="text-sm flex-1 text-left font-semibold">{label}</span>
          {isOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </>
      )}
    </button>
  );
}

// Child Menu Button Component
function ChildMenuButton({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      to={href}
      className={`
        sidebar-radio-item sidebar-radio-child
        block px-3 py-1.5 rounded-md text-sm ${isActive ? "is-active" : ""}
      `}
    >
      {label}
    </Link>
  );
}

function SidebarItem({
  item,
  collapsed,
  isOpen,
  onToggle,
  currentPath,
}: {
  item: MenuItem;
  collapsed: boolean;
  isOpen: boolean;
  onToggle: () => void;
  currentPath: string;
}) {
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const isActive = item.href === currentPath;
  const isSectionActive = hasSubmenu
    ? item.submenu!.some((s) => s.href === currentPath)
    : false;

  if (!hasSubmenu && item.href) {
    return (
      <Link
        to={item.href}
        className={`
          sidebar-radio-item
          w-full flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer font-semibold
          text-first dark:text-darkmodetext ${isActive ? "is-active" : ""}
        `}
      >
        {item.icon}
        {!collapsed && <span className="text-sm">{item.label}</span>}
      </Link>
    );
  }

  return (
    <div>
      <ParentMenuButton
        icon={item.icon}
        label={item.label}
        isOpen={isOpen}
        collapsed={collapsed}
        onClick={onToggle}
        active={isSectionActive || isOpen}
      />

      {!collapsed && isOpen && hasSubmenu && (
        <div className="ml-4 mt-1 space-y-1 pl-2">
          {item.submenu!.map((subItem) => (
            <ChildMenuButton
              key={subItem.href}
              href={subItem.href}
              label={subItem.label}
              isActive={subItem.href === currentPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}





