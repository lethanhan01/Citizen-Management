"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { User, Loader } from "lucide-react";
// @ts-ignore - api.js is a JavaScript file
import { apiFetch } from "@/stores/api";

interface CitizenData {
  person_id: string;
  full_name: string;
  alias?: string;
  gender: string;
  dob?: string;
  birthplace?: string;
  ethnicity?: string;
  hometown?: string;
  occupation?: string;
  workplace?: string;
  citizen_id_num?: string;
  citizen_id_issued_date?: string;
  citizen_id_issued_place?: string;
  residency_status?: string;
  residence_registered_date?: string;
  previous_address?: string;
  age?: number;
  households?: Array<{
    household_id: string;
    household_no?: string;
    address?: string;
  }>;
}

export default function CitizenDetail() {
  const { id } = useParams<{ id: string }>();
  const [citizen, setCitizen] = useState<CitizenData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchCitizen = async (personId: string) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await apiFetch(`/nhan-khau/${personId}`);
      if (response.success && response.data) {
        setCitizen(response.data);
      } else {
        setError("Không tìm thấy công dân với ID này");
        setCitizen(null);
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi tải thông tin công dân");
      setCitizen(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCitizen(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-first dark:text-darkmodetext">
        Chi tiết công dân {id ? `#${id}` : ""}
      </h2>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-third" />
          <span className="ml-2 text-first dark:text-darkmodetext">Đang tải thông tin...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-card text-card-foreground border border-red-500 rounded-xl p-6 shadow-sm">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* Citizen Info Card */}
      {citizen && !isLoading && (
        <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-6 mb-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-third/20 flex items-center justify-center">
                <User className="w-12 h-12 text-third" />
              </div>
            </div>

            {/* Info Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label="ID" value={citizen.person_id} />
              <InfoField label="Họ và tên" value={citizen.full_name} />
              {citizen.alias && <InfoField label="Tên gọi khác" value={citizen.alias} />}
              <InfoField label="Giới tính" value={citizen.gender || "N/A"} />
              <InfoField label="Ngày sinh" value={citizen.dob ? new Date(citizen.dob).toLocaleDateString("vi-VN") : "N/A"} />
              {citizen.age && <InfoField label="Tuổi" value={citizen.age.toString()} />}
              <InfoField label="CCCD/CMND" value={citizen.citizen_id_num || "N/A"} />
              <InfoField label="Dân tộc" value={citizen.ethnicity || "N/A"} />
              <InfoField label="Nơi sinh" value={citizen.birthplace || "N/A"} />
              <InfoField label="Nguyên quán" value={citizen.hometown || "N/A"} />
              <InfoField label="Nghề nghiệp" value={citizen.occupation || "N/A"} />
              <InfoField label="Nơi làm việc" value={citizen.workplace || "N/A"} />
              <InfoField label="Tình trạng cư trú" value={citizen.residency_status || "N/A"} />
              {citizen.citizen_id_issued_date && (
                <InfoField
                  label="Ngày cấp CCCD"
                  value={new Date(citizen.citizen_id_issued_date).toLocaleDateString("vi-VN")}
                />
              )}
              <InfoField label="Nơi cấp CCCD" value={citizen.citizen_id_issued_place || "N/A"} />
              {citizen.residence_registered_date && (
                <InfoField
                  label="Ngày đăng ký thường trú"
                  value={new Date(citizen.residence_registered_date).toLocaleDateString("vi-VN")}
                />
              )}
              {citizen.previous_address && (
                <InfoField label="Địa chỉ cũ" value={citizen.previous_address} />
              )}
              {citizen.households && citizen.households.length > 0 && (
                <InfoField
                  label="Hộ khẩu"
                  value={citizen.households.map((h) => h.household_no || h.household_id).join(", ")}
                />
              )}
              {citizen.households && citizen.households.length > 0 && (
                <InfoField
                  label="Địa chỉ"
                  value={citizen.households[0].address || "N/A"}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-second dark:text-darkmodetext/70 mb-1">{label}</label>
      <p className="text-sm text-first dark:text-darkmodetext font-medium">{value}</p>
    </div>
  );
}





