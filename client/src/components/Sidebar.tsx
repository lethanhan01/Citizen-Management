"use client";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  LayoutDashboard,
  Users,
  Home as HomeIcon,
  FileText,
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
      { label: "Thêm mới đến", href: "/services/add-new-arrival" },
      { label: "Thêm mới sinh", href: "/services/add-newborn" },
      { label: "Thay đổi nhân khẩu", href: "/services/update-person" },
      { label: "Tách hộ", href: "/services/split-household" },
      { label: "Nhập hộ", href: "/services/merge-household" },
      { label: "Thay đổi chủ hộ", href: "/services/change-owner" },
      { label: "Lịch sử hộ", href: "/services/household-history" },
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
        bg-white dark:bg-transparent dark:backdrop-blur-md shadow-md overflow-y-auto flex-shrink-0 z-50
        ${collapsed ? "w-16" : "w-60"}
      `}
    >
      {/* Sidebar header */}
      <div className="h-16 flex items-center justify-between px-4">
        {!collapsed && (
          <span className="text-lg font-semibold text-first dark:text-fourth">
            Administrator
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-second/10 dark:hover:bg-second/30 rounded-3xl transition"
          aria-label="Toggle sidebar"
        >
          <Menu className="text-first dark:text-fourth" />
        </button>
      </div>

      {/* MENU */}
      <nav className="mt-4 space-y-1 px-2">
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
}: {
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
        luxury-button
        w-full flex items-center gap-3 px-3 py-2 rounded-3xl cursor-pointer font-semibold
        text-first dark:text-fourth
      "
    >
      <div className="hover-bg" />
      <span className="button-text flex items-center gap-3 w-full">
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
      </span>
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
        block px-3 py-1.5 rounded-3xl text-sm transition
        ${
          isActive
            ? "bg-third/20 text-first dark:text-fourth font-medium"
            : "text-second dark:text-fourth/70 hover:bg-second/10 dark:hover:bg-second/30"
        }
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

  if (!hasSubmenu && item.href) {
    return (
      <Link
        to={item.href}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-3xl cursor-pointer transition font-semibold
          ${
            isActive
              ? "bg-third text-first font-medium"
              : "text-first dark:text-fourth hover:bg-second/10 dark:hover:bg-second/30"
          }
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
      />

      {!collapsed && isOpen && hasSubmenu && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-second/20 dark:border-second/30 pl-2">
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
