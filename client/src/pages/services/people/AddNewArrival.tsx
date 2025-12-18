"use client";

import { Loader } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface FormData {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  cccd: string;
  nationality: string;
  occupation: string;
  workplace: string;
  cmndCccdIssueDate: string;
  cmndCccdIssuePlace: string;
  address: string;
  status: "Thường trú" | "Tạm trú" | "Đã chuyển đi" | "";
  householdCode: string;
  permanentResidenceDate: string;
  relationshipToHead: string;
  isHead: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const REQUIRED_FIELDS: (keyof FormData)[] = [
  "fullName",
  "dateOfBirth",
  "gender",
  "cccd",
  "nationality",
  "occupation",
  "workplace",
  "cmndCccdIssueDate",
  "cmndCccdIssuePlace",
  "address",
  "status",
  "permanentResidenceDate",
  "relationshipToHead",
];

export default function AddNewArrival() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    cccd: "",
    nationality: "",
    occupation: "",
    workplace: "",
    cmndCccdIssueDate: "",
    cmndCccdIssuePlace: "",
    address: "",
    status: "",
    householdCode: "",
    permanentResidenceDate: "",
    relationshipToHead: "",
    isHead: false,
  });

  const filledRequiredFields = useMemo(() => {
    return REQUIRED_FIELDS.filter((field) => {
      const value = formData[field];
      if (typeof value === "boolean") return value;
      return value && value.toString().trim() !== "";
    }).length;
  }, [formData]);

  const progressPercentage = Math.round(
    (filledRequiredFields / REQUIRED_FIELDS.length) * 100
  );

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as string]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    REQUIRED_FIELDS.forEach((field) => {
      const value = formData[field];
      if (!value || value.toString().trim() === "") {
        newErrors[field] = "Trường này là bắt buộc";
      }
    });

    if (formData.cccd && formData.cccd.length < 9) {
      newErrors.cccd = "CCCD phải có ít nhất 9 chữ số";
    }

    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      if (dob > new Date()) {
        newErrors.dateOfBirth = "Ngày sinh không được ở tương lai";
      }
    }

    if (formData.permanentResidenceDate && formData.dateOfBirth) {
      const reg = new Date(formData.permanentResidenceDate);
      const dob = new Date(formData.dateOfBirth);
      if (reg < dob) {
        newErrors.permanentResidenceDate = "Ngày đăng ký phải sau ngày sinh";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      navigate("/citizens");
    } catch (err) {
      console.error("Error submitting form", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => navigate(-1);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-first dark:text-darkmodetext">
            Thêm nhân khẩu - Mới đến
          </h2>
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

      <form
        onSubmit={handleSubmit}
        className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm space-y-8"
      >
        <p className="text-second dark:text-darkmodetext/70">
          Nhập đầy đủ thông tin như trong trang chi tiết công dân. Mã hộ gia đình
          chỉ điền khi thêm vào hộ sẵn có (ví dụ: kết hôn). Nếu bỏ trống, hệ
          thống sẽ tự sinh mã hộ mới.
        </p>

        {/* Thông tin cơ bản */}
        <div className="space-y-4">
          <SectionTitle title="1. Thông tin cơ bản" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Họ và tên"
              required
              value={formData.fullName}
              onChange={(v) => handleInputChange("fullName", v)}
              error={errors.fullName}
              placeholder="Nhập họ và tên"
            />
            <FormField
              label="Ngày sinh"
              required
              type="date"
              value={formData.dateOfBirth}
              onChange={(v) => handleInputChange("dateOfBirth", v)}
              error={errors.dateOfBirth}
            />
            <FormField
              label="Giới tính"
              required
              type="select"
              options={["Nam", "Nữ"]}
              value={formData.gender}
              onChange={(v) => handleInputChange("gender", v)}
              error={errors.gender}
            />
            <FormField
              label="CCCD/CMND"
              required
              value={formData.cccd}
              onChange={(v) => handleInputChange("cccd", v)}
              error={errors.cccd}
              placeholder="Nhập số CCCD/CMND"
            />
            <FormField
              label="Quốc tịch/Dân tộc"
              required
              value={formData.nationality}
              onChange={(v) => handleInputChange("nationality", v)}
              error={errors.nationality}
              placeholder="Nhập quốc tịch/dân tộc"
            />
          </div>
        </div>

        {/* Thông tin công việc */}
        <div className="space-y-4 border-t border-second/20 dark:border-second/30 pt-6">
          <SectionTitle title="2. Thông tin công việc" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Nghề nghiệp"
              required
              value={formData.occupation}
              onChange={(v) => handleInputChange("occupation", v)}
              error={errors.occupation}
              placeholder="VD: Nhân viên văn phòng"
            />
            <FormField
              label="Nơi làm việc"
              required
              value={formData.workplace}
              onChange={(v) => handleInputChange("workplace", v)}
              error={errors.workplace}
              placeholder="Tên cơ quan / công ty"
            />
          </div>
        </div>

        {/* Giấy tờ */}
        <div className="space-y-4 border-t border-second/20 dark:border-second/30 pt-6">
          <SectionTitle title="3. Giấy tờ chứng thực" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Ngày cấp CCCD/CMND"
              required
              type="date"
              value={formData.cmndCccdIssueDate}
              onChange={(v) => handleInputChange("cmndCccdIssueDate", v)}
              error={errors.cmndCccdIssueDate}
            />
            <FormField
              label="Nơi cấp"
              required
              value={formData.cmndCccdIssuePlace}
              onChange={(v) => handleInputChange("cmndCccdIssuePlace", v)}
              error={errors.cmndCccdIssuePlace}
              placeholder="Cơ quan cấp"
            />
          </div>
        </div>

        {/* Thường trú */}
        <div className="space-y-4 border-t border-second/20 dark:border-second/30 pt-6">
          <SectionTitle title="4. Thông tin thường trú" />
          <FormField
            label="Địa chỉ thường trú"
            required
            type="textarea"
            rows={3}
            value={formData.address}
            onChange={(v) => handleInputChange("address", v)}
            error={errors.address}
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Tình trạng cư trú"
              required
              type="select"
              options={["Thường trú", "Tạm trú", "Đã chuyển đi"]}
              value={formData.status}
              onChange={(v) => handleInputChange("status", v)}
              error={errors.status}
            />
            <FormField
              label="Ngày đăng ký thường trú"
              required
              type="date"
              value={formData.permanentResidenceDate}
              onChange={(v) => handleInputChange("permanentResidenceDate", v)}
              error={errors.permanentResidenceDate}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Mã hộ gia đình (tuỳ chọn)"
              value={formData.householdCode}
              onChange={(v) => handleInputChange("householdCode", v)}
              placeholder="Nhập mã hộ nếu muốn thêm vào hộ hiện hữu"
              helperText="Để trống để hệ thống tự sinh mã hộ mới. Nếu điền, công dân sẽ được thêm vào hộ tương ứng."
            />
            <FormField
              label="Quan hệ với chủ hộ"
              required
              value={formData.relationshipToHead}
              onChange={(v) => handleInputChange("relationshipToHead", v)}
              error={errors.relationshipToHead}
              placeholder="VD: Chủ hộ, Vợ, Chồng, Con"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-first dark:text-darkmodetext">
            <input
              type="checkbox"
              checked={formData.isHead}
              onChange={(e) => handleInputChange("isHead", e.target.checked)}
              className="w-4 h-4 rounded"
            />
            Đánh dấu là chủ hộ
          </label>
        </div>

        {/* Actions */}
        <div className="border-t border-second/20 dark:border-second/30 pt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-lg font-medium border border-second/40 dark:border-second/30 text-first dark:text-darkmodetext hover:bg-second/10 dark:hover:bg-second/30 disabled:opacity-50 transition"
          >
            Huỷ bỏ
          </button>
          <button
            type="submit"
            disabled={isLoading || progressPercentage < 100}
            className="px-6 py-2.5 rounded-lg font-medium bg-third text-first hover:bg-third/90 disabled:opacity-50 flex items-center gap-2 transition"
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
  type?: "text" | "date" | "textarea" | "select";
  options?: string[];
  rows?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  helperText?: string;
}

function FormField({
  label,
  required = false,
  type = "text",
  options,
  rows = 1,
  value,
  onChange,
  error,
  placeholder,
  helperText,
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
    <div className="space-y-1">
      <label className="block text-sm font-medium text-first dark:text-darkmodetext">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseClasses}
        />
      ) : type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClasses}
        >
          <option value="">-- Chọn --</option>
          {options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseClasses}
        />
      )}
      {helperText && (
        <p className="text-xs text-second dark:text-darkmodetext/60">{helperText}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h3 className="text-lg font-semibold text-first dark:text-darkmodetext">
      {title}
    </h3>
  );
}





