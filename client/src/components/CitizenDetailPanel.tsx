"use client";

import { X, Eye, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Citizen } from "@/types/citizen";

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
            Chi tiết công dân
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
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${
                  citizen.status === "Thường trú"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : citizen.status === "Tạm trú"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300"
                }
              `}
            >
              {citizen.status}
            </span>
            {citizen.isDeceased && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
                Đã qua đời
              </span>
            )}
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-first dark:text-fourth">
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
          <div className="space-y-4 border-t border-second/20 dark:border-second/30 pt-4">
            <h4 className="font-semibold text-first dark:text-fourth">
              Thông tin công việc
            </h4>

            <DetailRow label="Nghề nghiệp" value={citizen.occupation || "N/A"} />
            <DetailRow label="Nơi làm việc" value={citizen.workplace || "N/A"} />
          </div>

          {/* ID Info */}
          <div className="space-y-4 border-t border-second/20 dark:border-second/30 pt-4">
            <h4 className="font-semibold text-first dark:text-fourth">
              Giấy tờ chứng thực
            </h4>

            <DetailRow label="Số CCCD/CMND" value={citizen.cccd} />
            <DetailRow label="Ngày cấp" value={citizen.cmndCccdIssueDate || "N/A"} />
            <DetailRow label="Nơi cấp" value={citizen.cmndCccdIssuePlace || "N/A"} />
          </div>

          {/* Residence Info */}
          <div className="space-y-4 border-t border-second/20 dark:border-second/30 pt-4">
            <h4 className="font-semibold text-first dark:text-fourth">
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
          <div className="space-y-3 border-t border-second/20 dark:border-second/30 pt-4">
            <h4 className="font-semibold text-first dark:text-fourth">
              Hành động
            </h4>

            <button
              onClick={handleViewHousehold}
              className="
                w-full px-4 py-2 rounded-lg
                bg-third text-first
                hover:bg-third/90
                transition flex items-center justify-center gap-2
                font-medium text-sm
              "
            >
              <LinkIcon className="w-4 h-4" />
              Xem toàn bộ hộ gia đình
            </button>

            <button
              onClick={handleEdit}
              className="
                w-full px-4 py-2 rounded-lg
                border border-second/40 dark:border-second/30
                text-first dark:text-fourth
                hover:bg-second/10 dark:hover:bg-second/30
                transition flex items-center justify-center gap-2
                font-medium text-sm
              "
            >
              <Eye className="w-4 h-4" />
              Chỉnh sửa thông tin
            </button>
          </div>

          {/* Deceased Checkbox */}
          <div className="border-t border-second/20 dark:border-second/30 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={citizen.isDeceased || false}
                readOnly
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-first dark:text-fourth">
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
      <span className="text-sm text-second dark:text-fourth/70 font-medium">
        {label}:
      </span>
      <span className="text-sm text-first dark:text-fourth font-medium">
        {value}
      </span>
    </div>
  );
}
