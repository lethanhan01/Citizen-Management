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
  useTheme();

  if (!household) return null;

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
            Chi tiết hộ khẩu
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
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">
              Thông tin hộ khẩu
            </h4>

            <DetailRow label="Mã hộ khẩu" value={household.code} />
            <DetailRow label="Chủ hộ" value={household.headName} />
            <DetailRow label="Địa chỉ" value={household.address} />
            <DetailRow label="Ngày đăng kí" value={household.registrationDate} />
            <DetailRow label="Số thành viên" value={household.memberCount.toString()} />
          </div>

          {/* Members List */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h4 className="font-semibold text-foreground">
              Danh sách thành viên
            </h4>

            <div className="space-y-2">
              {household.members.map((member) => (
                <div
                  key={member.id}
                  className="p-3 rounded-lg bg-card border border-border"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">
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
                      <p className="text-xs text-muted-foreground">
                        CCCD: {member.cccd}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.relationship}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-3 border-t border-border">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/services/household/split")}
                className="
                  px-4 py-2 rounded-lg text-sm font-medium
                  transition hover:opacity-90
                  bg-primary text-white
                "
              >
                Tách hộ
              </button>
              <button
                onClick={() => navigate("/services/household/change-address")}
                className="
                  px-4 py-2 rounded-lg text-sm font-medium
                  transition hover:opacity-90
                  bg-primary text-white
                "
              >
                Thay đổi địa chỉ hộ
              </button>
            </div>

            {/* History Link */}
            <button
              onClick={() => navigate(`/services/household/history?household_no=${household.code}`)}
              className="
                w-full text-sm text-primary hover:text-primary/80
                border-b-2 border-primary pb-1
                transition text-center font-medium
              "
            >
              Xem lịch sử thay đổi hộ
            </button>
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





