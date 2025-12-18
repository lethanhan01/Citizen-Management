"use client";

import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Household } from "@/types/household";
import { useTheme } from "@/context/ThemeProvider";

interface HouseholdDetailPanelProps {
  household: Household | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function HouseholdDetailPanel({
  household,
  isOpen,
  onClose,
}: HouseholdDetailPanelProps) {
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
        cardBg: "#0f172a",
        cardBorder: "rgba(255,255,255,0.10)",
        primaryBtnBg: "#495da7",
        primaryBtnText: "#ffffff",
        secondaryBtnBg: "#22c55e",
        secondaryBtnText: "#ffffff",
        link: "#ababab",
      }
    : {
        overlay: "rgba(0,0,0,0.30)",
        bg: "#ffffff",
        headerBg: "#ffffff",
        border: "rgba(85,85,85,0.40)",
        textPrimary: "#2c2b2d",
        textSecondary: "#555555",
        icon: "#2c2b2d",
        cardBg: "#f5f7fb",
        cardBorder: "rgba(85,85,85,0.18)",
        primaryBtnBg: "#3b82f6",
        primaryBtnText: "#ffffff",
        secondaryBtnBg: "#22c55e",
        secondaryBtnText: "#ffffff",
        link: "#ababab",
      };

  if (!household) return null;

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
            Chi tiết hộ khẩu
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
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="font-semibold" style={{ color: palette.textPrimary }}>
              Thông tin hộ khẩu
            </h4>

            <DetailRow label="Mã hộ khẩu" value={household.code} colors={{ primary: palette.textPrimary, secondary: palette.textSecondary }} />
            <DetailRow label="Chủ hộ" value={household.headName} colors={{ primary: palette.textPrimary, secondary: palette.textSecondary }} />
            <DetailRow label="Địa chỉ" value={household.address} colors={{ primary: palette.textPrimary, secondary: palette.textSecondary }} />
            <DetailRow label="Ngày đăng kí" value={household.registrationDate} colors={{ primary: palette.textPrimary, secondary: palette.textSecondary }} />
            <DetailRow label="Số thành viên" value={household.memberCount.toString()} colors={{ primary: palette.textPrimary, secondary: palette.textSecondary }} />
          </div>

          {/* Members List */}
          <div className="space-y-4 pt-4" style={{ borderTop: `1px solid ${palette.border}` }}>
            <h4 className="font-semibold" style={{ color: palette.textPrimary }}>
              Danh sách thành viên
            </h4>

            <div className="space-y-2">
              {household.members.map((member) => (
                <div
                  key={member.id}
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: palette.cardBg, border: `1px solid ${palette.cardBorder}` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium" style={{ color: palette.textPrimary }}>
                        {member.fullName}
                        {member.isHead && (
                          <span
                            className="ml-2 text-xs px-2 py-1 rounded"
                            style={{ backgroundColor: "rgba(73,93,167,0.20)", color: "#495da7" }}
                          >
                            Chủ hộ
                          </span>
                        )}
                      </p>
                      <p className="text-xs" style={{ color: palette.textSecondary }}>
                        CCCD: {member.cccd}
                      </p>
                      <p className="text-xs" style={{ color: palette.textSecondary }}>
                        {member.relationship}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-3" style={{ borderTop: `1px solid ${palette.border}` }}>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/services/split-household")}
                className="
                  px-4 py-2 rounded-lg text-sm font-medium
                  transition hover:opacity-90
                "
                style={{ backgroundColor: palette.primaryBtnBg, color: palette.primaryBtnText }}
              >
                Tách hộ
              </button>
              <button
                onClick={() => navigate("/services/merge-household")}
                className="
                  px-4 py-2 rounded-lg text-sm font-medium
                  transition hover:opacity-90
                "
                style={{ backgroundColor: palette.secondaryBtnBg, color: palette.secondaryBtnText }}
              >
                Nhập hộ
              </button>
            </div>

            {/* History Link */}
            <button
              onClick={() => navigate("/services/household-history")}
              className="
                w-full text-sm text-third hover:text-third/80
                border-b-2 pb-1
                transition text-center font-medium
              "
              style={{ color: palette.link, borderColor: palette.link }}
            >
              Xem lịch sử thay đổi hộ
            </button>
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
