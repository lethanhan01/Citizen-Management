"use client";

import { X, Eye, Link as LinkIcon } from "lucide-react";
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

  const palette = theme === "dark"
    ? {
        overlay: "rgba(0,0,0,0.5)",
        bg: "#2c2b2d",
        headerBg: "#2c2b2d",
        border: "rgba(255,255,255,0.18)",
        textPrimary: "#ffffff",
        textSecondary: "rgba(255,255,255,0.70)",
        icon: "#ffffff",
        primaryBtnBg: "#495da7",
        primaryBtnText: "#ffffff",
        secondaryBtnText: "#ffffff",
      }
    : {
        overlay: "rgba(0,0,0,0.30)",
        bg: "#ffffff",
        headerBg: "#ffffff",
        border: "rgba(85,85,85,0.40)",
        textPrimary: "#2c2b2d",
        textSecondary: "#555555",
        icon: "#2c2b2d",
        primaryBtnBg: "#495da7",
        primaryBtnText: "#2c2b2d",
        secondaryBtnText: "#2c2b2d",
      };

  if (!citizen) return null;

  const handleViewHousehold = () => {
    navigate(`/households/${citizen.householdCode}`);
  };

  const handleEdit = () => {
    navigate(`/services/update-person?citizenId=${citizen.id}`);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 transition-opacity"
          style={{ backgroundColor: palette.overlay }}
          onClick={onClose}
        />
      )}

      {/* Details Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full md:w-[40%] lg:w-[35%]
          
          shadow-2xl
          transform transition-transform duration-300 ease-in-out
          overflow-y-auto
          z-51
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ backgroundColor: palette.bg, borderLeft: `1px solid ${palette.border}` }}
      >
        {/* Header */}
        <div
          className="sticky top-0 flex items-center justify-between p-6"
          style={{
            backgroundColor: palette.headerBg,
            borderBottom: `1px solid ${palette.border}`,
          }}
        >
          <h3 className="text-lg font-bold" style={{ color: palette.textPrimary }}>
            Chi tiết công dân
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-md transition hover:opacity-90"
            aria-label="Close"
          >
            <X className="w-5 h-5" style={{ color: palette.icon }} />
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
                if (citizen.status === "Thường trú") {
                  return theme === "dark"
                    ? { backgroundColor: "rgba(20,83,45,0.30)", color: "#4ade80" }
                    : { backgroundColor: "#DCFCE7", color: "#166534" };
                }
                if (citizen.status === "Tạm trú") {
                  return theme === "dark"
                    ? { backgroundColor: "rgba(113,63,18,0.30)", color: "#facc15" }
                    : { backgroundColor: "#FEF9C3", color: "#a16207" };
                }
                if (citizen.status === "Tạm vắng") {
                  return theme === "dark"
                    ? { backgroundColor: "rgba(30,64,175,0.35)", color: "#93c5fd" }
                    : { backgroundColor: "#DBEAFE", color: "#1d4ed8" };
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
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={theme === "dark"
                  ? { backgroundColor: "rgba(17,24,39,0.30)", color: "#9CA3AF" }
                  : { backgroundColor: "#F3F4F6", color: "#374151" }}
              >
                Đã qua đời
              </span>
            )}
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="font-semibold" style={{ color: palette.textPrimary }}>
              Thông tin cơ bản
            </h4>
            <DetailRow label="CCCD/CMND" value={citizen.cccd} colors={{ primary: palette.textPrimary, secondary: palette.textSecondary }} />
            <DetailRow label="Họ và tên" value={citizen.fullName} colors={{ primary: palette.textPrimary, secondary: palette.textSecondary }} />
            <DetailRow label="Ngày sinh" value={citizen.dateOfBirth} colors={{ primary: palette.textPrimary, secondary: palette.textSecondary }} />
            <DetailRow label="Giới tính" value={citizen.gender} colors={{ primary: palette.textPrimary, secondary: palette.textSecondary }} />
            <DetailRow label="Dân tộc" value={citizen.nationality || "N/A"} colors={{ primary: palette.textPrimary, secondary: palette.textSecondary }} />
            <DetailRow label="Nguyên quán" value="N/A" colors={{ primary: palette.textPrimary, secondary: palette.textSecondary }} />
          </div>

          {/* Work Info */}
          <div className="space-y-4 pt-4" style={{ borderTop: `1px solid ${palette.border}` }}>
            <h4 className="font-semibold" style={{ color: palette.textPrimary }}>
              Thông tin công việc
            </h4>
            <DetailRow label="Nghề nghiệp" value={citizen.occupation || "N/A"} colors={{ primary: palette.textPrimary, secondary: palette.textSecondary }} />
            <DetailRow label="Nơi làm việc" value={citizen.workplace || "N/A"} colors={{ primary: palette.textPrimary, secondary: palette.textSecondary }} />
          </div>

          {/* ID Info */}
          <div className="space-y-4 pt-4" style={{ borderTop: `1px solid ${palette.border}` }}>
            <h4 className="font-semibold" style={{ color: palette.textPrimary }}>
              Giấy tờ chứng thực
            </h4>
            <DetailRow label="Số CCCD/CMND" value={citizen.cccd} colors={{ primary: palette.textPrimary, secondary: palette.textSecondary }} />
            <DetailRow label="Ngày cấp" value={citizen.cmndCccdIssueDate || "N/A"} colors={{ primary: palette.textPrimary, secondary: palette.textSecondary }} />
            <DetailRow label="Nơi cấp" value={citizen.cmndCccdIssuePlace || "N/A"} colors={{ primary: palette.textPrimary, secondary: palette.textSecondary }} />
          </div>

          {/* Residence Info */}
          <div className="space-y-4 pt-4" style={{ borderTop: `1px solid ${palette.border}` }}>
            <h4 className="font-semibold" style={{ color: palette.textPrimary }}>
              Thông tin thường trú
            </h4>
            <DetailRow label="Mã hộ gia đình" value={citizen.householdCode} colors={{ primary: palette.textPrimary, secondary: palette.textSecondary }} />
            <DetailRow label="Địa chỉ" value={citizen.address} colors={{ primary: palette.textPrimary, secondary: palette.textSecondary }} />
            <DetailRow
              label="Ngày đăng ký"
              value={citizen.permanentResidenceDate || "N/A"}
              colors={{ primary: palette.textPrimary, secondary: palette.textSecondary }}
            />

            {citizen.relationshipToHead && (
              <DetailRow
                label="Mối quan hệ"
                value={citizen.relationshipToHead}
                colors={{ primary: palette.textPrimary, secondary: palette.textSecondary }}
              />
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4" style={{ borderTop: `1px solid ${palette.border}` }}>
            <h4 className="font-semibold" style={{ color: palette.textPrimary }}>
              Hành động
            </h4>

            <button
              onClick={handleViewHousehold}
              className="
                w-full px-4 py-2 rounded-lg
                transition flex items-center justify-center gap-2 hover:opacity-90
                font-medium text-sm
              "
              style={{ backgroundColor: palette.primaryBtnBg, color: palette.primaryBtnText }}
            >
              <LinkIcon className="w-4 h-4" />
              Xem toàn bộ hộ gia đình
            </button>

            <button
              onClick={handleEdit}
              className="
                w-full px-4 py-2 rounded-lg
                transition flex items-center justify-center gap-2 hover:opacity-90
                font-medium text-sm
              "
              style={{ border: `1px solid ${palette.border}`, color: palette.secondaryBtnText }}
            >
              <Eye className="w-4 h-4" />
              Chỉnh sửa thông tin
            </button>
          </div>

          {/* Deceased Checkbox */}
          <div className="pt-4" style={{ borderTop: `1px solid ${palette.border}` }}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={citizen.isDeceased || false}
                readOnly
                className="w-4 h-4 rounded"
              />
              <span className="text-sm" style={{ color: palette.textPrimary }}>
                Đã qua đời
              </span>
            </label>
          </div>
        </div>
      </div>
    </>
  );
}

function DetailRow({ label, value, colors }: { label: string; value: string; colors: { primary: string; secondary: string } }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm font-medium" style={{ color: colors.secondary }}>
        {label}:
      </span>
      <span className="text-sm font-medium" style={{ color: colors.primary }}>
        {value}
      </span>
    </div>
  );
}
