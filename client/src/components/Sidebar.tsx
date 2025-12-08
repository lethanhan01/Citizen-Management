"use client";

import { useState } from "react";
import { Menu, Home, Users, Settings } from "lucide-react";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
}

const defaultMenuItems: MenuItem[] = [
  { icon: <Home className="w-5 h-5" />, label: "Trang chủ", href: "/" },
  { icon: <Users className="w-5 h-5" />, label: "Người dân", href: "/users" },
  { icon: <Settings className="w-5 h-5" />, label: "Cài đặt", href: "/settings" },
];

export default function Sidebar({ items = defaultMenuItems }: { items?: MenuItem[] }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        h-screen border-r border-second/40 dark:border-second/30 transition-all duration-300
        bg-white dark:bg-transparent dark:backdrop-blur-md shadow-md
        ${collapsed ? "w-16" : "w-60"}
      `}
    >
      {/* Sidebar header */}
      <div className="h-16 flex items-center justify-between px-4">
        {!collapsed && (
          <span className="text-lg font-semibold text-first dark:text-fourth">
            CitizenSys
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-second/10 dark:hover:bg-second/30 rounded-md transition"
          aria-label="Toggle sidebar"
        >
          <Menu className="text-first dark:text-fourth" />
        </button>
      </div>

      {/* MENU */}
      <nav className="mt-4 space-y-1">
        {items.map((item, index) => (
          <SidebarItem
            key={index}
            icon={item.icon}
            label={item.label}
            href={item.href}
            collapsed={collapsed}
          />
        ))}
      </nav>
    </aside>
  );
}

/* REUSABLE SIDEBAR ITEM */
function SidebarItem({
  icon,
  label,
  href,
  collapsed,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  collapsed: boolean;
}) {
  return (
    <a
      href={href}
      className="
        flex items-center gap-3 px-4 py-2 cursor-pointer
        hover:bg-second/10 dark:hover:bg-second/30
        text-first dark:text-fourth transition rounded-md mx-2
      "
    >
      {icon}
      {!collapsed && <span className="text-sm">{label}</span>}
    </a>
  );
}
