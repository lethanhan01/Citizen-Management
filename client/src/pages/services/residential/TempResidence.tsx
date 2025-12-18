"use client";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";

interface FormData {
  // Section 1: Thông tin người khai báo
  fullName: string;
  dateOfBirth: string;
  cccd: string;
  gender: string;
  permanentAddress: string;
  // Section 2: Thông tin tạm trú
  tempAddress: string;
  tempFromDate: string;
  tempToDate: string;
  reason: string;
}

interface FormErrors {
  [key: string]: string;
}

const REQUIRED_FIELDS = [
  "fullName",
  "dateOfBirth",
  "cccd",
  "gender",
  "permanentAddress",
  "tempAddress",
  "tempFromDate",
  "tempToDate",
];

export default function TempResidence() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    dateOfBirth: "",
    cccd: "",
    gender: "",
    permanentAddress: "",
    tempAddress: "",
    tempFromDate: "",
    tempToDate: "",
    reason: "",
  });

  // Calculate progress
  const filledRequiredFields = useMemo(() => {
    return REQUIRED_FIELDS.filter((field) => {
      const value = formData[field as keyof FormData];
      return value && value.trim() !== "";
    }).length;
  }, [formData]);

  const progressPercentage = Math.round(
    (filledRequiredFields / REQUIRED_FIELDS.length) * 100
  );

  const handleInputChange = (
    field: keyof FormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
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

    // Check required fields
    REQUIRED_FIELDS.forEach((field) => {
      const value = formData[field as keyof FormData];
      if (!value || value.trim() === "") {
        newErrors[field] = "Trường này là bắt buộc";
      }
    });

    // Validate date range
    if (formData.tempFromDate && formData.tempToDate) {
      const fromDate = new Date(formData.tempFromDate);
      const toDate = new Date(formData.tempToDate);
      if (fromDate >= toDate) {
        newErrors.tempToDate = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }

    // Validate CCCD format (simple check)
    if (formData.cccd && formData.cccd.length < 9) {
      newErrors.cccd = "CCCD phải có ít nhất 9 chữ số";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Show success and redirect
      navigate("/services/temp-residence");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-first dark:text-darkmodetext">
            Hoàn thành: {progressPercentage}%
          </span>
        </div>
        <div className="w-full h-2 bg-second/20 dark:bg-second/30 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600">
          <div
            className={`h-full transition-all duration-300 ${
              progressPercentage === 100
                ? "bg-green-500"
                : progressPercentage >= 50
                ? "bg-blue-500"
                : "bg-cyan-400"
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm space-y-6"
      >
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-first dark:text-darkmodetext mb-2">
            Biểu mẫu Đăng kí tạm trú
          </h2>
          <p className="text-sm text-second dark:text-darkmodetext/70">
            Vui lòng điền đầy đủ và chính xác các thông tin dưới đây. Các mục có
            dấu <span className="text-red-500">*</span> là bắt buộc.
          </p>
        </div>

        {/* Section 1: Thông tin người khai báo */}
        <div className="space-y-4 border-t border-second/20 dark:border-second/30 pt-6">
          <h3 className="text-lg font-semibold text-first dark:text-darkmodetext">
            1. Thông tin người khai báo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Họ và tên */}
            <FormField
              label="Họ và tên"
              required
              type="text"
              value={formData.fullName}
              onChange={(value) => handleInputChange("fullName", value)}
              error={errors.fullName}
              placeholder="Nhập họ và tên"
            />

            {/* Ngày sinh */}
            <FormField
              label="Ngày sinh"
              required
              type="date"
              value={formData.dateOfBirth}
              onChange={(value) => handleInputChange("dateOfBirth", value)}
              error={errors.dateOfBirth}
            />

            {/* CCCD */}
            <FormField
              label="CCCD"
              required
              type="text"
              value={formData.cccd}
              onChange={(value) => handleInputChange("cccd", value)}
              error={errors.cccd}
              placeholder="Nhập số CCCD"
            />

            {/* Giới tính */}
            <div>
              <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                Giới tính <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                className={`
                  w-full px-4 py-2.5 rounded-lg
                  bg-white dark:bg-transparent dark:border
                  border ${
                    errors.gender
                      ? "border-red-500 dark:border-red-500"
                      : "border-second/40 dark:border-second/30"
                  }
                  text-first dark:text-darkmodetext
                  focus:outline-none focus:ring-1 focus:ring-selectring transition
                `}
              >
                <option value="">-- Chọn giới tính --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
              {errors.gender && (
                <p className="text-xs text-red-500 mt-1">{errors.gender}</p>
              )}
            </div>
          </div>

          {/* Nơi thường trú */}
          <FormField
            label="Nơi thường trú"
            required
            type="textarea"
            value={formData.permanentAddress}
            onChange={(value) => handleInputChange("permanentAddress", value)}
            error={errors.permanentAddress}
            placeholder="Nhập địa chỉ thường trú"
            rows={3}
          />
        </div>

        {/* Section 2: Thông tin đăng kí tạm trú */}
        <div className="space-y-4 border-t border-second/20 dark:border-second/30 pt-6">
          <h3 className="text-lg font-semibold text-first dark:text-darkmodetext">
            2. Thông tin đăng kí tạm trú
          </h3>

          {/* Địa chỉ tạm trú */}
          <FormField
            label="Địa chỉ tạm trú"
            required
            type="textarea"
            value={formData.tempAddress}
            onChange={(value) => handleInputChange("tempAddress", value)}
            error={errors.tempAddress}
            placeholder="Nhập địa chỉ tạm trú"
            rows={3}
          />

          {/* Thời hạn tạm trú */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-first dark:text-darkmodetext">
              Thời hạn tạm trú <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Từ ngày"
                required
                type="date"
                value={formData.tempFromDate}
                onChange={(value) => handleInputChange("tempFromDate", value)}
                error={errors.tempFromDate}
                hideLabel
              />
              <FormField
                label="Tới ngày"
                required
                type="date"
                value={formData.tempToDate}
                onChange={(value) => handleInputChange("tempToDate", value)}
                error={errors.tempToDate}
                hideLabel
              />
            </div>
            {errors.tempFromDate && (
              <p className="text-xs text-red-500">{errors.tempFromDate}</p>
            )}
            {errors.tempToDate && (
              <p className="text-xs text-red-500">{errors.tempToDate}</p>
            )}
          </div>

          {/* Lý do tạm trú */}
          <FormField
            label="Lý do tạm trú (nếu có)"
            required={false}
            type="textarea"
            value={formData.reason}
            onChange={(value) => handleInputChange("reason", value)}
            placeholder="Nhập lý do tạm trú (không bắt buộc)"
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="border-t border-second/20 dark:border-second/30 pt-6 flex gap-4 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="
              px-6 py-2.5 rounded-lg font-medium
              border border-second/40 dark:border-second/30
              text-first dark:text-darkmodetext
              hover:bg-second/10 dark:hover:bg-second/30
              disabled:opacity-50 disabled:cursor-not-allowed
              transition
            "
          >
            Huỷ bỏ
          </button>
          <button
            type="submit"
            disabled={isLoading || progressPercentage < 100}
            className="
              px-6 py-2.5 rounded-lg font-medium
              bg-third text-first
              hover:bg-third/90
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2
              transition
            "
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Lưu"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  type: "text" | "date" | "textarea";
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
    border ${
      error
        ? "border-red-500 dark:border-red-500"
        : "border-second/40 dark:border-second/30"
    }
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
      {type === "textarea" ? (
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






