// src/lib/citizen-ui.ts
import type { Citizen } from "@/types/citizen";

export function genderLabel(g: any) {
  return g === "male" ? "Nam" : g === "female" ? "Nữ" : g === "other" ? "Khác" : "-";
}

export function statusLabel(s: any) {
  return s === "permanent"
    ? "Thường trú"
    : s === "temporary_resident"
    ? "Tạm trú"
    : s === "temporary_absent"
    ? "Tạm vắng"
    : s === "moved_out"
    ? "Đã chuyển đi"
    : s === "deceased"
    ? "Đã mất"
    : "-";
}

export function statusTone(status: Citizen["status"]) {
  // trả về class tailwind cho badge (giữ nguyên style của bạn)
  if (status === "permanent") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  if (status === "temporary_resident") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  if (status === "temporary_absent") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  return "bg-gray-200 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300";
}

export function statusDot(status: Citizen["status"]) {
  if (status === "permanent") return "🟢";
  if (status === "temporary_resident") return "🟡";
  if (status === "temporary_absent") return "🔵";
  return "⚪";
}
