'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Search } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { usePersonStore } from '@/stores/person.store';
import { useCitizenListParams } from '@/hooks/useCitizenListParams';
import PaginationBar from '@/components/PaginationBar';
import { mapPersonToCitizen } from '@/mappers/person.mapper';
import { toast, Toaster } from 'react-hot-toast';

import { useTempResidenceStore } from '@/stores/tempResidence.store';

interface Citizen {
  id: string;
  cccd: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  householdCode: string;
  address: string;
}

interface FormData {
  fullName: string;
  dateOfBirth: string;
  cccd: string;
  gender: string;
  permanentHouseholdCode: string;
  destination: string;
  tempAbsenceFromDate: string;
  tempAbsenceToDate: string;
  reason: string;
}

interface FormErrors {
  [key: string]: string;
}

const REQUIRED_FIELDS = [
  'fullName',
  'dateOfBirth',
  'cccd',
  'gender',
  'permanentHouseholdCode',
  'destination',
  'tempAbsenceFromDate',
  'tempAbsenceToDate',
];

export default function TempAbsence() {
  const navigate = useNavigate();
  const topRef = useRef<HTMLDivElement>(null);
  const token = useAuthStore((s) => s.token);
  const persistedToken = useMemo(
    () => token || localStorage.getItem('token'),
    [token],
  );

  const {
    createTempAbsence,
    loading: isSubmitting,
    error: submitError,
  } = useTempResidenceStore();

  // Shared data source + server pagination
  const LIMIT = 200;
  const [page, setPage] = useState(1);
  const {
    data,
    loading: listLoading,
    pagination,
    fetchPersons,
  } = usePersonStore();

  // Search & list
  const [search, setSearch] = useState('');
  const [] = useState<Citizen[]>([]);
  const [] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);

  // Form
  // const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const createInitialFormData = (): FormData => ({
    fullName: '',
    dateOfBirth: '',
    cccd: '',
    gender: '',
    permanentHouseholdCode: '',
    destination: '',
    tempAbsenceFromDate: '',
    tempAbsenceToDate: '',
    reason: '',
  });
  const [formData, setFormData] = useState<FormData>(createInitialFormData());

  // Fetch citizens via store (shared with CitizenList)
  const params = useCitizenListParams({
    page,
    limit: LIMIT,
    searchQuery: search,
    sortBy: 'name',
    filterGender: 'all',
    filterStatus: 'all',
  });

  useEffect(() => {
    if (!persistedToken) return;
    fetchPersons(params);
  }, [persistedToken, params, fetchPersons, search]);

  // Use store data; only show list when search has value
  const showList = useMemo(() => search.trim().length > 0, [search]);
  const filteredCitizens = useMemo(() => {
    if (!showList) return [];
    const arr = Array.isArray(data) ? data.map(mapPersonToCitizen) : [];
    return arr.map((c) => ({
      id: c.id,
      cccd: c.cccd,
      fullName: c.fullName,
      dateOfBirth: c.dateOfBirth,
      gender: c.gender as any,
      householdCode: c.householdCode,
      address: c.address,
    }));
  }, [data, showList]);

  // Auto-fill form when selecting citizen
  const handleSelectCitizen = (citizen: Citizen) => {
    setSelectedCitizen(citizen);
    setFormData({
      fullName: citizen.fullName,
      dateOfBirth: citizen.dateOfBirth,
      cccd: citizen.cccd,
      gender: citizen.gender,
      permanentHouseholdCode: citizen.householdCode,
      destination: '',
      tempAbsenceFromDate: '',
      tempAbsenceToDate: '',
      reason: '',
    });
    setErrors({});
  };

  // Calculate progress
  const filledRequiredFields = useMemo(() => {
    return REQUIRED_FIELDS.filter((field) => {
      const value = formData[field as keyof FormData];
      return value && value.trim() !== '';
    }).length;
  }, [formData]);

  const progressPercentage = Math.round(
    (filledRequiredFields / REQUIRED_FIELDS.length) * 100,
  );

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    REQUIRED_FIELDS.forEach((field) => {
      const value = formData[field as keyof FormData];
      if (!value || value.trim() === '') {
        newErrors[field] = 'Trường này là bắt buộc';
      }
    });

    if (formData.tempAbsenceFromDate && formData.tempAbsenceToDate) {
      const fromDate = new Date(formData.tempAbsenceFromDate);
      const toDate = new Date(formData.tempAbsenceToDate);
      if (fromDate >= toDate) {
        newErrors.tempAbsenceToDate = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }

    if (formData.cccd && formData.cccd.length < 9) {
      newErrors.cccd = 'CCCD phải có ít nhất 9 chữ số';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại các trường bắt buộc!');
      return;
    }

    const payload = {
      household_no: formData.permanentHouseholdCode,
      citizen_id: formData.cccd,
      from_date: formData.tempAbsenceFromDate,
      to_date: formData.tempAbsenceToDate,
      note: `Nơi đến: ${formData.destination}. Lý do: ${formData.reason || 'Không có'}`,
    };

    const success = await createTempAbsence(payload);

    if (success) {
      toast.success('Đăng ký tạm vắng thành công!');
      setTimeout(() => {
        navigate('/services/temp-absence');
      }, 1000);
    } else {
      const currentError = useTempResidenceStore.getState().error;
      toast.error(currentError || 'Đăng ký thất bại. Vui lòng thử lại!');
    }
  };

  const resetForm = () => {
    setFormData(createInitialFormData());
    setErrors({});
    setSelectedCitizen(null);
  };

  const handleCancel = () => {
    // Confirm before clearing all inputs and states
    const ok = window.confirm("Bạn có chắc muốn xóa toàn bộ dữ liệu đã nhập?");
    if (!ok) return;
    resetForm();
    const scrollToTop = () => {
      // Prefer scrolling the container that owns this page
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      // Fallbacks for various scroll containers
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      const se = (document.scrollingElement || document.documentElement) as any;
      se?.scrollTo?.({ top: 0, behavior: "smooth" });
      if (se) se.scrollTop = 0;
    };
    // Wait for DOM to settle after reset, then scroll
    window.requestAnimationFrame(scrollToTop);
  };

  return (
    <div ref={topRef} className="space-y-6">
      {/* --- TOASTER --- */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          className: '',
          style: {
            border: '1px solid #713200',
            padding: '16px',
            color: '#713200',
          },
        }}
      />
      {/* Search & List */}
      <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-first dark:text-darkmodetext mb-4">
          Tìm kiếm công dân
        </h3>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Tìm theo tên, CCCD, mã hộ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-second/40 dark:border-second/30 bg-white dark:bg-transparent text-first dark:text-darkmodetext focus:outline-none focus:ring-1 focus:ring-selectring dark:placeholder:text-darkmodetext/50"
          />
          <Search className="w-5 h-5 absolute left-3 top-3 text-second dark:text-darkmodetext/50" />
        </div>

        {showList &&
          (listLoading ? (
            <div className="flex items-center gap-2 text-second">
              <Loader className="w-4 h-4 animate-spin" />
              Đang tải...
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredCitizens.length === 0 ? (
                  <p className="text-second dark:text-darkmodetext/60 text-sm">
                    Không tìm thấy công dân
                  </p>
                ) : (
                  filteredCitizens.map((citizen) => (
                    <button
                      key={citizen.id}
                      onClick={() => handleSelectCitizen(citizen)}
                      className={`w-full p-3 rounded-lg border text-left transition ${
                        selectedCitizen?.id === citizen.id
                          ? 'bg-slate-200 dark:bg-slate-600 border-slate-300 dark:border-slate-500 text-first dark:text-white'
                          : 'bg-white dark:bg-transparent border-second/20 dark:border-slate-600 text-first dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="font-medium">{citizen.fullName}</div>
                      <div className="text-sm opacity-70">
                        CCCD: {citizen.cccd}
                      </div>
                    </button>
                  ))
                )}
              </div>
              {pagination && (
                <div className="mt-3">
                  <PaginationBar
                    currentPage={pagination.currentPage ?? page}
                    totalPages={pagination.totalPages ?? 1}
                    totalItems={pagination.totalItems ?? 0}
                    startIdx={
                      ((pagination.currentPage ?? page) - 1) *
                      (pagination.itemsPerPage ?? LIMIT)
                    }
                    pageSize={pagination.itemsPerPage ?? LIMIT}
                    currentCount={filteredCitizens.length}
                    onPageChange={(p) => setPage(p)}
                  />
                </div>
              )}
            </>
          ))}
      </div>

      {/* Progress Bar */}
      {selectedCitizen && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-first dark:text-darkmodetext">
              Hoàn thành: {progressPercentage}%
            </span>
          </div>
          <div className="w-full h-2 bg-second/20 dark:bg-second/30 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                progressPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Form */}
      {selectedCitizen && (
        <form
          onSubmit={handleSubmit}
          className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm space-y-6"
        >
          <div>
            <h2 className="text-2xl font-bold text-first dark:text-darkmodetext mb-2">
              Biểu mẫu Đăng kí tạm vắng
            </h2>
            <p className="text-sm text-second dark:text-darkmodetext/70">
              Các mục có dấu <span className="text-red-500">*</span> là bắt
              buộc.
            </p>
          </div>

          {/* Hiển thị lỗi từ API nếu có */}
          {submitError && (
            <div
              className="p-3 bg-red-100 border border-red-400 text-red-700 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Lỗi! </strong>
              <span className="block sm:inline">{submitError}</span>
            </div>
          )}

          {/* Section 1: Thông tin người khai báo (read-only) */}
          <div className="space-y-4 border-t border-second/20 dark:border-second/30 pt-6">
            <h3 className="text-lg font-semibold text-first dark:text-darkmodetext">
              1. Thông tin người khai báo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Họ và tên"
                required
                type="text"
                value={formData.fullName}
                onChange={(v) => handleInputChange('fullName', v)}
                error={errors.fullName}
                placeholder="Họ và tên"
              />
              <FormField
                label="Ngày sinh"
                required
                type="date"
                value={formData.dateOfBirth}
                onChange={(v) => handleInputChange('dateOfBirth', v)}
                error={errors.dateOfBirth}
              />
              <FormField
                label="CCCD"
                required
                type="text"
                value={formData.cccd}
                onChange={(v) => handleInputChange('cccd', v)}
                error={errors.cccd}
              />
              <div>
                <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-second/40 dark:border-second/30 bg-white dark:bg-transparent text-first dark:text-darkmodetext"
                >
                  <option value="">-- Chọn --</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
            </div>

            <FormField
              label="Số hộ khẩu thường trú"
              required
              type="text"
              value={formData.permanentHouseholdCode}
              onChange={(v) => handleInputChange('permanentHouseholdCode', v)}
              error={errors.permanentHouseholdCode}
              placeholder="Số hộ khẩu"
            />
          </div>

          {/* Section 2: Thông tin tạm vắng */}
          <div className="space-y-4 border-t border-second/20 dark:border-second/30 pt-6">
            <h3 className="text-lg font-semibold text-first dark:text-darkmodetext">
              2. Thông tin tạm vắng
            </h3>

            <FormField
              label="Nơi đi"
              required
              type="textarea"
              value={formData.destination}
              onChange={(v) => handleInputChange('destination', v)}
              error={errors.destination}
              placeholder="Nhập địa chỉ/nơi đi"
              rows={3}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-first dark:text-darkmodetext">
                Thời hạn tạm vắng <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Từ ngày"
                  required
                  type="date"
                  value={formData.tempAbsenceFromDate}
                  onChange={(v) => handleInputChange('tempAbsenceFromDate', v)}
                  error={errors.tempAbsenceFromDate}
                  hideLabel
                />
                <FormField
                  label="Tới ngày"
                  required
                  type="date"
                  value={formData.tempAbsenceToDate}
                  onChange={(v) => handleInputChange('tempAbsenceToDate', v)}
                  error={errors.tempAbsenceToDate}
                  hideLabel
                />
              </div>
            </div>

            <FormField
              label="Lý do tạm vắng (nếu có)"
              required={false}
              type="textarea"
              value={formData.reason}
              onChange={(v) => handleInputChange('reason', v)}
              placeholder="Nhập lý do (không bắt buộc)"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="border-t border-second/20 dark:border-second/30 pt-6 flex gap-4 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg font-medium border border-second/40 dark:border-second/30 text-first dark:text-darkmodetext hover:bg-second/10 dark:hover:bg-second/30 disabled:opacity-50"
            >
              Huỷ bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || progressPercentage < 100}
              className="px-6 py-2.5 rounded-lg font-medium bg-third text-first hover:bg-emerald-400 dark:hover:bg-emerald-500 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  type: 'text' | 'date' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  rows?: number;
  hideLabel?: boolean;
}

function FormField({
  label,
  required = false,
  type,
  value,
  onChange,
  error,
  placeholder,
  rows = 1,
  hideLabel = false,
}: FormFieldProps) {
  const baseClasses = `
    w-full px-4 py-2.5 rounded-lg
    bg-white dark:bg-transparent dark:border
    border ${error ? 'border-red-500' : 'border-second/40 dark:border-second/30'}
    text-first dark:text-darkmodetext
    placeholder:text-second dark:placeholder:text-darkmodetext/40
    focus:outline-none focus:ring-1 focus:ring-selectring transition
  `;

  return (
    <div>
      {!hideLabel && (
        <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={baseClasses}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseClasses}
        />
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
