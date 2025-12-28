"use client";

import { X, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Citizen } from "@/types/citizen";
import { useTheme } from "@/context/ThemeProvider";

interface CitizenDetailPanelProps {
  citizen: Citizen | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CitizenDetailPanel({
  citizen,
  isOpen,
  onClose,
}: CitizenDetailPanelProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();

  if (!citizen) return null;

  const handleEdit = () => {
    navigate(`/services/update-person?citizenId=${citizen.id}&search=${encodeURIComponent(citizen.fullName)}`);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 dark:bg-black/30 transition-opacity cursor-pointer"
          onClick={onClose}
        />
      )}

      {/* Details Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full md:w-[40%] lg:w-[35%]
          bg-card text-card-foreground
          shadow-2xl
          transform transition-transform duration-300 ease-in-out
          overflow-y-auto
          z-51 border-l border-border
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div
          className="sticky top-0 flex items-center justify-between p-6 bg-card border-b border-border"
        >
          <h3 className="text-lg font-bold text-foreground">
            Chi tiết công dân
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-md transition hover:opacity-90 text-foreground"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`
                px-3 py-1 rounded-full text-sm font-medium
              `}
              style={(() => {
                if (citizen.status === "permanent") {
                  return theme === "dark"
                    ? { backgroundColor: "rgba(20,83,45,0.30)", color: "#4ade80" }
                    : { backgroundColor: "#DCFCE7", color: "#166534" };
                }
                if (citizen.status === "temporary_resident") {
                  return theme === "dark"
                    ? { backgroundColor: "rgba(113,63,18,0.30)", color: "#facc15" }
                    : { backgroundColor: "#FEF9C3", color: "#a16207" };
                }
                if (citizen.status === "temporary_absent") {
                  return theme === "dark"
                    ? { backgroundColor: "rgba(30,64,175,0.35)", color: "#93c5fd" }
                    : { backgroundColor: "#DBEAFE", color: "#1d4ed8" };
                }
                if (citizen.status === "moved_out" || citizen.isDeceased) {
                  return theme === "dark"
                    ? { backgroundColor: "rgba(0,0,0,0.60)", color: "#F3F4F6" }
                    : { backgroundColor: "#000000", color: "#FFFFFF" };
                }
                return theme === "dark"
                  ? { backgroundColor: "rgba(31,41,55,0.60)", color: "#D1D5DB" }
                  : { backgroundColor: "#E5E7EB", color: "#374151" };
              })()}
            >
              {citizen.status}
            </span>
            {citizen.isDeceased && (
              <span
                className="px-3 py-1 rounded-full text-sm font-medium text-muted-foreground"
                style={theme === "dark"
                  ? { backgroundColor: "rgba(17,24,39,0.30)" }
                  : { backgroundColor: "#F3F4F6" }}
              >
                Đã qua đời
              </span>
            )}
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">
              Thông tin cơ bản
            </h4>
            <DetailRow label="CCCD/CMND" value={citizen.cccd} />
            <DetailRow label="Họ và tên" value={citizen.fullName} />
            <DetailRow label="Ngày sinh" value={citizen.dateOfBirth} />
            <DetailRow label="Giới tính" value={citizen.gender} />
            <DetailRow label="Dân tộc" value={citizen.nationality || "N/A"} />
            <DetailRow label="Nguyên quán" value="N/A" />
          </div>

          {/* Work Info */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h4 className="font-semibold text-foreground">
              Thông tin công việc
            </h4>
            <DetailRow label="Nghề nghiệp" value={citizen.occupation || "N/A"} />
            <DetailRow label="Nơi làm việc" value={citizen.workplace || "N/A"} />
          </div>

          {/* ID Info */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h4 className="font-semibold text-foreground">
              Giấy tờ chứng thực
            </h4>
            <DetailRow label="Số CCCD/CMND" value={citizen.cccd} />
            <DetailRow label="Ngày cấp" value={citizen.cmndCccdIssueDate || "N/A"} />
            <DetailRow label="Nơi cấp" value={citizen.cmndCccdIssuePlace || "N/A"} />
          </div>

          {/* Residence Info */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h4 className="font-semibold text-foreground">
              Thông tin thường trú
            </h4>
            <DetailRow label="Mã hộ gia đình" value={citizen.householdCode} />
            <DetailRow label="Địa chỉ" value={citizen.address} />
            <DetailRow
              label="Ngày đăng ký"
              value={citizen.permanentResidenceDate || "N/A"}
            />

            {citizen.relationshipToHead && (
              <DetailRow
                label="Mối quan hệ"
                value={citizen.relationshipToHead}
              />
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="font-semibold text-foreground">
              Hành động
            </h4>

            <button
              onClick={handleEdit}
              className="
                w-full px-4 py-2 rounded-lg
                transition flex items-center justify-center gap-2 hover:opacity-90
                font-medium text-sm
                border border-border text-foreground
              "
            >
              <Eye className="w-4 h-4" />
              Chỉnh sửa thông tin
            </button>
          </div>

          {/* Deceased Checkbox */}
          <div className="pt-4 border-t border-border">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={citizen.isDeceased || false}
                readOnly
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-foreground">
                Đã qua đời
              </span>
            </label>
          </div>
        </div>
      </div>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm font-medium text-muted-foreground">
        {label}:
      </span>
      <span className="text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}





