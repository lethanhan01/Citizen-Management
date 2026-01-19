"use client";

import { useParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { Loader } from "lucide-react";
import { usePersonStore } from "@/stores/person.store";
import type { Citizen, Gender, ResidencyStatus } from "@/types/citizen";
import type { UnknownRecord } from "@/types/api";

const toGender = (value: unknown): Gender =>
  value === "male" || value === "female" || value === "other" || value === "unknown" ? value : "unknown";

const toResidencyStatus = (value: unknown): ResidencyStatus =>
  value === "permanent" ||
  value === "temporary_resident" ||
  value === "temporary_absent" ||
  value === "moved_out" ||
  value === "deceased"
    ? value
    : "permanent";

function toCitizen(p: UnknownRecord): Citizen {
  const households = (p as { households?: unknown }).households;
  const firstHousehold = Array.isArray(households) ? households[0] : households || null;
  const householdMembership =
    firstHousehold?.HouseholdMembership || firstHousehold?.households?.HouseholdMembership;

  return {
    id: String((p as { person_id?: unknown; id?: unknown }).person_id ?? (p as { id?: unknown }).id ?? ""),
    cccd: String((p as { citizen_id_num?: unknown }).citizen_id_num ?? ""),
    fullName: String((p as { full_name?: unknown }).full_name ?? ""),
    dateOfBirth: String((p as { dob?: unknown }).dob ?? ""),
    gender: toGender((p as { gender?: unknown }).gender),
    householdCode: String((firstHousehold as { household_no?: unknown })?.household_no ?? ""),
    address: String((firstHousehold as { address?: unknown })?.address ?? (p as { previous_address?: unknown }).previous_address ?? ""),
    status: toResidencyStatus((p as { residency_status?: unknown }).residency_status),
    start_date: String((p as { start_date?: unknown }).start_date ?? ""),
    end_date: String((p as { end_date?: unknown }).end_date ?? ""),
    ethnicity: String((p as { ethnicity?: unknown }).ethnicity ?? ""),
    hometown: String((p as { hometown?: unknown }).hometown ?? ""), 
    nationality: undefined,
    occupation: (p as { occupation?: string }).occupation ?? undefined,
    workplace: (p as { workplace?: string }).workplace ?? undefined,
    cmndCccdIssueDate: (p as { citizen_id_issued_date?: string }).citizen_id_issued_date ?? undefined,
    cmndCccdIssuePlace: (p as { citizen_id_issued_place?: string }).citizen_id_issued_place ?? undefined,
    permanentResidenceDate: (p as { residence_registered_date?: string }).residence_registered_date ?? undefined,
    isHead: Boolean((householdMembership as { is_head?: unknown })?.is_head ?? false),
    relationshipToHead: (householdMembership as { relation_to_head?: string })?.relation_to_head ?? undefined,
    isDeceased: false,
  };
}

export default function CitizenDetail() {
  const { id } = useParams();
  const { current, loading, error, fetchPersonById } = usePersonStore();

  useEffect(() => {
    if (id) fetchPersonById(String(id));
  }, [id, fetchPersonById]);

  const citizen = useMemo(() => {
    return current ? toCitizen(current) : null;
  }, [current]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Chi tiết công dân #{id}</h2>

      <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader className="w-5 h-5 animate-spin" />
            <span>Đang tải thông tin...</span>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-300/40 bg-red-50/30 px-4 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        ) : !citizen ? (
          <p className="text-muted-foreground">Không tìm thấy công dân</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Họ tên" value={citizen.fullName} />
              <Field label="CCCD" value={citizen.cccd} />
              <Field label="Ngày sinh" value={citizen.dateOfBirth ? new Date(citizen.dateOfBirth).toLocaleDateString("vi-VN") : "-"} />
              <Field label="Giới tính" value={citizen.gender ?? "-"} />
              <Field label="Mã hộ" value={citizen.householdCode ?? "-"} />
              <Field label="Trạng thái" value={citizen.status} />
            </div>
            <Field label="Địa chỉ" value={citizen.address ?? "-"} fullWidth />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nghề nghiệp" value={citizen.occupation ?? "-"} />
              <Field label="Nơi làm việc" value={citizen.workplace ?? "-"} />
              <Field label="Ngày cấp CCCD" value={citizen.cmndCccdIssueDate ?? "-"} />
              <Field label="Nơi cấp CCCD" value={citizen.cmndCccdIssuePlace ?? "-"} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, fullWidth }: { label: string; value: string | number; fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? "col-span-1 md:col-span-2" : undefined}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-medium text-foreground">{String(value)}</p>
    </div>
  );
}





