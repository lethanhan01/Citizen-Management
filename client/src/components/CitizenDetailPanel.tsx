'use client';

import { X, Eye, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Citizen } from '@/types/citizen';
import { useTheme } from '@/context/ThemeProvider';
import { toast } from 'react-hot-toast';

interface CitizenDetailPanelProps {
  citizen: Citizen | null;
  isOpen: boolean;
  onClose: () => void;
}

// 1. Helper Format Ngày
const formatDate = (dateString?: string) => {
  if (!dateString || dateString === 'N/A') return '-';
  try {
    return new Date(dateString).toLocaleDateString('vi-VN');
  } catch {
    return dateString;
  }
};

// 2. Helper Format Giới tính
const formatGender = (val?: string) => {
  if (!val) return '-';
  const lower = val.toLowerCase();
  if (lower === 'male') return 'Nam';
  if (lower === 'female') return 'Nữ';
  return val;
};

// Helper: Chuyển đổi trạng thái sang Tiếng Việt
const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    permanent: 'Thường trú',
    temporary_resident: 'Tạm trú',
    temporary_absent: 'Tạm vắng',
    moved_out: 'Đã chuyển đi',
    deceased: 'Đã qua đời',
  };
  // Trả về tiếng Việt, nếu không tìm thấy thì trả về nguyên gốc
  return statusMap[status] || status;
};

export default function CitizenDetailPanel({
  citizen,
  isOpen,
  onClose,
}: CitizenDetailPanelProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();

  if (!citizen) return null;

  const handleEdit = () => {
    navigate('/services/update-person');
  };

  const handleCopyName = async () => {
    try {
      await navigator.clipboard.writeText(citizen.fullName);
      toast.success('Đã copy tên công dân!');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Không thể copy tên');
    }
  };

  // Helper chọn màu badge
  const getStatusStyle = (status: string) => {
    if (status === 'permanent') {
      return theme === 'dark'
        ? { backgroundColor: 'rgba(20,83,45,0.30)', color: '#4ade80' }
        : { backgroundColor: '#DCFCE7', color: '#166534' };
    }
    if (status === 'temporary_resident') {
      return theme === 'dark'
        ? { backgroundColor: 'rgba(113,63,18,0.30)', color: '#facc15' }
        : { backgroundColor: '#FEF9C3', color: '#a16207' };
    }
    if (status === 'temporary_absent') {
      return theme === 'dark'
        ? { backgroundColor: 'rgba(30,64,175,0.35)', color: '#93c5fd' }
        : { backgroundColor: '#DBEAFE', color: '#1d4ed8' };
    }
    if (status === 'moved_out' || citizen.isDeceased) {
      return theme === 'dark'
        ? { backgroundColor: 'rgba(0,0,0,0.60)', color: '#F3F4F6' }
        : { backgroundColor: '#000000', color: '#FFFFFF' };
    }
    return theme === 'dark'
      ? { backgroundColor: 'rgba(31,41,55,0.60)', color: '#D1D5DB' }
      : { backgroundColor: '#E5E7EB', color: '#374151' };
  };

  // Kiểm tra xem có phải trạng thái tạm thời không
  const isTemporaryStatus =
    citizen.status === 'temporary_resident' ||
    citizen.status === 'temporary_absent';

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
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 bg-card border-b border-border">
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
              style={getStatusStyle(citizen.status)}
            >
              {formatStatus(citizen.status)}
            </span>
            {/* Chỉ hiển thị badge "Đã qua đời" riêng nếu status không phải "deceased" (tránh trùng lặp) */}
            {citizen.isDeceased && citizen.status !== 'deceased' && (
              <span
                className="px-3 py-1 rounded-full text-sm font-medium text-muted-foreground"
                style={
                  theme === 'dark'
                    ? { backgroundColor: 'rgba(17,24,39,0.30)' }
                    : { backgroundColor: '#F3F4F6' }
                }
              >
                Đã qua đời
              </span>
            )}
          </div>

          {/* --- 3. LOGIC HIỂN THỊ THỜI HẠN TẠM TRÚ/TẠM VẮNG --- */}
          {isTemporaryStatus && (
            <div className="space-y-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
              <h4 className="font-semibold text-blue-700 dark:text-blue-400">
                {citizen.status === 'temporary_resident'
                  ? 'Thời hạn Tạm trú'
                  : 'Thời hạn Tạm vắng'}
              </h4>
              <DetailRow
                label="Từ ngày"
                value={formatDate(citizen.start_date)}
              />
              <DetailRow
                label="Đến ngày"
                value={formatDate(citizen.end_date)}
              />
              {/* Nếu cần tính số ngày còn lại, có thể thêm logic ở đây */}
            </div>
          )}
          {/* --------------------------------------------------- */}

          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Thông tin cơ bản</h4>
            <DetailRow label="CCCD/CMND" value={citizen.cccd} />
            <DetailRow label="Họ và tên" value={citizen.fullName} />
            <DetailRow
              label="Ngày sinh"
              value={formatDate(citizen.dateOfBirth)}
            />
            <DetailRow label="Giới tính" value={formatGender(citizen.gender)} />
            <DetailRow label="Dân tộc" value={citizen.ethnicity || 'N/A'} />
            <DetailRow label="Nguyên quán" value={citizen.hometown || 'N/A'} />
          </div>

          {/* Work Info */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h4 className="font-semibold text-foreground">
              Thông tin công việc
            </h4>
            <DetailRow
              label="Nghề nghiệp"
              value={citizen.occupation || 'N/A'}
            />
            <DetailRow
              label="Nơi làm việc"
              value={citizen.workplace || 'N/A'}
            />
          </div>

          {/* ID Info */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h4 className="font-semibold text-foreground">
              Giấy tờ chứng thực
            </h4>
            <DetailRow label="Số CCCD/CMND" value={citizen.cccd} />
            <DetailRow
              label="Ngày cấp"
              value={citizen.cmndCccdIssueDate || 'N/A'}
            />
            <DetailRow
              label="Nơi cấp"
              value={citizen.cmndCccdIssuePlace || 'N/A'}
            />
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
              value={citizen.permanentResidenceDate || 'N/A'}
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
            <h4 className="font-semibold text-foreground">Hành động</h4>

            <button
              onClick={handleEdit}
              className="
                w-full px-4 py-2 rounded-lg
                transition-all flex items-center justify-center gap-2
                font-medium text-sm
                border border-border text-foreground
                hover:bg-blue-50 dark:hover:bg-blue-900/20
                hover:border-blue-300 dark:hover:border-blue-700
              "
            >
              <Eye className="w-4 h-4" />
              Chỉnh sửa chi tiết công dân
            </button>

            <button
              onClick={handleCopyName}
              className="
                w-full px-4 py-2 rounded-lg
                transition-all flex items-center justify-center gap-2
                font-medium text-sm
                border border-border text-foreground
                hover:bg-blue-50 dark:hover:bg-blue-900/20
                hover:border-blue-300 dark:hover:border-blue-700
              "
            >
              <Copy className="w-4 h-4" />
              Copy tên công dân
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
              <span className="text-sm text-foreground">Đã qua đời</span>
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
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
