// src/lib/citizen-ui.ts
import type { Citizen } from "@/types/citizen";

export function genderLabel(gender?: Citizen['gender'] | string | null) {
  return gender === "male" ? "Nam" : gender === "female" ? "Nữ" : gender === "other" ? "Khác" : "-";
}

export function statusLabel(status?: Citizen['status'] | string | null) {
  return status === "permanent"
    ? "Thường trú"
    : status === "temporary_resident"
    ? "Tạm trú"
    : status === "temporary_absent"
    ? "Tạm vắng"
    : status === "moved_out"
    ? "Đã chuyển đi"
    : status === "deceased"
    ? "Đã mất"
    : "-";
}

export function statusTone(status: Citizen["status"]) {
  // trả về class tailwind cho badge (giữ nguyên style của bạn)
  if (status === "permanent") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  if (status === "temporary_resident") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  if (status === "temporary_absent") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  if (status === "deceased") return "bg-black text-white dark:bg-gray-900 dark:text-gray-100";
  return "bg-gray-200 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300";
}

export function statusDot(status: Citizen["status"]) {
  if (status === "permanent") return "🟢";
  if (status === "temporary_resident") return "🟡";
  if (status === "temporary_absent") return "🔵";
  if (status === "deceased") return "⚫";
  return "⚪";
}
