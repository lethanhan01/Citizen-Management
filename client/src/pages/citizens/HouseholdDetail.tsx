"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Loader } from "lucide-react";
import { useHouseholdStore } from "@/stores/household.store";
import type { Household } from "@/types/household";
import type { UnknownRecord } from "@/types/api";

function toHousehold(h: UnknownRecord): Household {
  const residents = (h as { residents?: unknown }).residents;
  const head = Array.isArray(residents)
    ? residents.find((m: UnknownRecord) =>
        (m as { HouseholdMembership?: { is_head?: unknown } })?.HouseholdMembership?.is_head ||
        (m as { is_head?: unknown })?.is_head
      )
    : (h as { headPerson?: unknown; head?: unknown }).headPerson || (h as { head?: unknown }).head || null;
  return {
    id: String((h as { household_id?: unknown; id?: unknown }).household_id ?? (h as { id?: unknown }).id ?? ""),
    code: String((h as { household_no?: unknown; code?: unknown }).household_no ?? (h as { code?: unknown }).code ?? ""),
    headName: String(
      (head as { full_name?: unknown })?.full_name ??
        (h as { headPerson?: { full_name?: unknown } })?.headPerson?.full_name ??
        (h as { headName?: unknown }).headName ??
        ""
    ),
    headId: String(
      (head as { person_id?: unknown; id?: unknown })?.person_id ??
        (head as { id?: unknown })?.id ??
        (h as { headPerson?: { person_id?: unknown } })?.headPerson?.person_id ??
        ""
    ),
    address: String((h as { address?: unknown }).address ?? ""),
    registrationDate: String((h as { registration_date?: unknown; created_at?: unknown }).registration_date ?? (h as { created_at?: unknown }).created_at ?? ""),
    memberCount: Number(
      (h as { members_count?: unknown; memberCount?: unknown }).members_count ??
        (h as { memberCount?: unknown }).memberCount ??
        (Array.isArray(residents) ? residents.length : 0)
    ),
    members:
      Array.isArray(residents)
        ? residents.map((m: UnknownRecord) => ({
            id: String((m as { person_id?: unknown; id?: unknown }).person_id ?? (m as { id?: unknown }).id ?? ""),
            fullName: String((m as { full_name?: unknown }).full_name ?? ""),
            cccd: String((m as { citizen_id_num?: unknown }).citizen_id_num ?? ""),
            relationship: String(
              (m as { HouseholdMembership?: { relation_to_head?: unknown } })?.HouseholdMembership?.relation_to_head ??
                (m as { relationship?: unknown }).relationship ??
                ""
            ),
            isHead: Boolean(
              (m as { HouseholdMembership?: { is_head?: unknown } })?.HouseholdMembership?.is_head ??
                (m as { isHead?: unknown }).isHead ??
                false
            ),
          }))
        : [],
    lastUpdated: (h as { updated_at?: string }).updated_at ?? undefined,
  };
}

export default function HouseholdDetail() {
  const { id } = useParams();
  const { current, loading, error, fetchHouseholdById } = useHouseholdStore();

  useEffect(() => {
    if (id) fetchHouseholdById(String(id));
  }, [id, fetchHouseholdById]);

  const household = useMemo(() => (current ? toHousehold(current) : null), [current]);

  type ResidentDetail = {
    id: string;
    fullName: string;
    cccd?: string;
    gender?: string;
    dob?: string;
    relationship: string;
    isHead: boolean;
  };

  const residentDetails: ResidentDetail[] = useMemo(() => {
    const arr: UnknownRecord[] = Array.isArray((current as { residents?: unknown })?.residents)
      ? (((current as { residents?: unknown[] }).residents ?? []) as UnknownRecord[])
      : [];
    return arr.map((m: UnknownRecord) => ({
      id: String((m as { person_id?: unknown; id?: unknown }).person_id ?? (m as { id?: unknown }).id ?? ""),
      fullName: String((m as { full_name?: unknown }).full_name ?? ""),
      cccd: (m as { citizen_id_num?: string }).citizen_id_num ?? undefined,
      gender: (m as { gender?: string }).gender ?? undefined,
      dob: (m as { dob?: string }).dob ?? undefined,
      relationship: (m as { HouseholdMembership?: { relation_to_head?: string } })?.HouseholdMembership?.relation_to_head ?? "",
      isHead: Boolean((m as { HouseholdMembership?: { is_head?: unknown } })?.HouseholdMembership?.is_head ?? false),
    }));
  }, [current]);

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
              {residentDetails.length === 0 ? (
                <p className="text-muted-foreground">Chưa có thông tin thành viên</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-second/40 dark:border-second/30 bg-second/5 dark:bg-second/10">
                        <th className="px-4 py-3 text-left">Họ tên</th>
                        <th className="px-4 py-3 text-left">Giới tính</th>
                        <th className="px-4 py-3 text-left">Ngày sinh</th>
                        <th className="px-4 py-3 text-left">CCCD</th>
                        <th className="px-4 py-3 text-left">Quan hệ với chủ hộ</th>
                        <th className="px-4 py-3 text-left">Vai trò</th>
                      </tr>
                    </thead>
                    <tbody>
                      {residentDetails.map((m) => (
                        <tr key={m.id} className="border-b border-second/20">
                          <td className="px-4 py-2">{m.fullName}</td>
                          <td className="px-4 py-2">{m.gender ?? "—"}</td>
                          <td className="px-4 py-2">{m.dob ? new Date(m.dob).toLocaleDateString("vi-VN") : "—"}</td>
                          <td className="px-4 py-2">{m.cccd ?? "—"}</td>
                          <td className="px-4 py-2">{m.relationship || "—"}</td>
                          <td className="px-4 py-2">{m.isHead ? "Chủ hộ" : "Thành viên"}</td>
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





