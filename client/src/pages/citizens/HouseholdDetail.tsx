"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Loader } from "lucide-react";
import { useHouseholdStore } from "@/stores/household.store";
import type { Household } from "@/types/household";

function toHousehold(h: any): Household {
  const head = Array.isArray(h?.members)
    ? h.members.find((m: any) => m?.HouseholdMembership?.is_head || m?.is_head)
    : h?.head || null;
  return {
    id: String(h?.household_id ?? h?.id ?? ""),
    code: String(h?.household_no ?? h?.code ?? ""),
    headName: String(head?.full_name ?? h?.headName ?? ""),
    headId: String(head?.person_id ?? head?.id ?? ""),
    address: String(h?.address ?? ""),
    registrationDate: String(h?.registration_date ?? h?.created_at ?? ""),
    memberCount: Number(
      h?.members_count ?? h?.memberCount ?? (Array.isArray(h?.members) ? h.members.length : 0)
    ),
    members:
      Array.isArray(h?.members)
        ? h.members.map((m: any) => ({
            id: String(m?.person_id ?? m?.id ?? ""),
            fullName: String(m?.full_name ?? ""),
            cccd: String(m?.citizen_id_num ?? ""),
            relationship: m?.HouseholdMembership?.relation_to_head ?? m?.relationship ?? "",
            isHead: Boolean(m?.HouseholdMembership?.is_head ?? m?.isHead ?? false),
          }))
        : [],
    lastUpdated: h?.updated_at ?? undefined,
  };
}

export default function HouseholdDetail() {
  const { id } = useParams();
  const { current, loading, error, fetchHouseholdById } = useHouseholdStore();

  useEffect(() => {
    if (id) fetchHouseholdById(String(id));
  }, [id, fetchHouseholdById]);

  const household = useMemo(() => (current ? toHousehold(current) : null), [current]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Chi tiết hộ khẩu</h2>

      <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader className="w-8 h-8 text-third animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-danger font-semibold">Đã xảy ra lỗi</p>
            <p className="text-second dark:text-darkmodetext/70 mt-1">{error}</p>
          </div>
        ) : !household ? (
          <p className="text-muted-foreground">Không tìm thấy hộ khẩu</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-second dark:text-darkmodetext/70">Mã hộ khẩu</p>
                <p className="text-first dark:text-darkmodetext font-medium">{household.code}</p>
              </div>
              <div>
                <p className="text-sm text-second dark:text-darkmodetext/70">Chủ hộ</p>
                <p className="text-first dark:text-darkmodetext font-medium">{household.headName}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-second dark:text-darkmodetext/70">Địa chỉ</p>
                <p className="text-first dark:text-darkmodetext font-medium">{household.address}</p>
              </div>
              <div>
                <p className="text-sm text-second dark:text-darkmodetext/70">Ngày đăng kí</p>
                <p className="text-first dark:text-darkmodetext font-medium">
                  {household.registrationDate ? new Date(household.registrationDate).toLocaleDateString("vi-VN") : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-second dark:text-darkmodetext/70">Số thành viên</p>
                <p className="text-first dark:text-darkmodetext font-medium">{household.memberCount}</p>
              </div>
            </div>

            <div className="border-t border-second/30 pt-4">
              <h3 className="text-lg font-semibold mb-2">Thành viên</h3>
              {household.members.length === 0 ? (
                <p className="text-muted-foreground">Chưa có thông tin thành viên</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-second/40 dark:border-second/30 bg-second/5 dark:bg-second/10">
                        <th className="px-4 py-3 text-left">Họ tên</th>
                        <th className="px-4 py-3 text-left">CCCD</th>
                        <th className="px-4 py-3 text-left">Quan hệ với chủ hộ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {household.members.map((m) => (
                        <tr key={m.id} className="border-b border-second/20">
                          <td className="px-4 py-2">{m.fullName}</td>
                          <td className="px-4 py-2">{m.cccd}</td>
                          <td className="px-4 py-2">
                            {m.relationship}
                            {m.isHead ? " (Chủ hộ)" : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}





