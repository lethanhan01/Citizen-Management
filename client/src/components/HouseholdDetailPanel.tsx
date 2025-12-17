"use client";

import { X, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Household } from "@/types/household";

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

  if (!household) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Details Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full md:w-[40%] lg:w-[35%]
          bg-white dark:bg-first
          border-l border-second/40 dark:border-second/30
          shadow-2xl
          transform transition-transform duration-300 ease-in-out
          overflow-y-auto
          z-50
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-second/40 dark:border-second/30 bg-white dark:bg-first/95">
          <h3 className="text-lg font-bold text-first dark:text-fourth">
            Chi tiết hộ khẩu
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-second/10 dark:hover:bg-second/30 rounded-md transition"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-first dark:text-fourth" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-first dark:text-fourth">
              Thông tin hộ khẩu
            </h4>

            <DetailRow label="Mã hộ khẩu" value={household.code} />
            <DetailRow label="Chủ hộ" value={household.headName} />
            <DetailRow label="Địa chỉ" value={household.address} />
            <DetailRow label="Ngày đăng kí" value={household.registrationDate} />
            <DetailRow label="Số thành viên" value={household.memberCount.toString()} />
          </div>

          {/* Members List */}
          <div className="space-y-4 border-t border-second/20 dark:border-second/30 pt-4">
            <h4 className="font-semibold text-first dark:text-fourth">
              Danh sách thành viên
            </h4>

            <div className="space-y-2">
              {household.members.map((member) => (
                <div
                  key={member.id}
                  className="p-3 rounded-lg bg-second/5 dark:bg-second/10 border border-second/20 dark:border-second/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-first dark:text-fourth">
                        {member.fullName}
                        {member.isHead && (
                          <span className="ml-2 text-xs px-2 py-1 bg-third/20 text-third rounded">
                            Chủ hộ
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-second dark:text-fourth/70">
                        CCCD: {member.cccd}
                      </p>
                      <p className="text-xs text-second dark:text-fourth/70">
                        {member.relationship}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-second/20 dark:border-second/30 pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/services/split-household")}
                className="
                  px-4 py-2 rounded-lg text-sm font-medium
                  bg-blue-500 text-white
                  hover:bg-blue-600
                  transition
                "
              >
                Tách hộ
              </button>
              <button
                onClick={() => navigate("/services/merge-household")}
                className="
                  px-4 py-2 rounded-lg text-sm font-medium
                  bg-green-500 text-white
                  hover:bg-green-600
                  transition
                "
              >
                Nhập hộ
              </button>
            </div>

            {/* History Link */}
            <button
              onClick={() => navigate("/services/household-history")}
              className="
                w-full text-sm text-third hover:text-third/80
                border-b-2 border-third pb-1
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
      <span className="text-sm text-second dark:text-fourth/70 font-medium">
        {label}:
      </span>
      <span className="text-sm text-first dark:text-fourth font-medium">
        {value}
      </span>
    </div>
  );
}
