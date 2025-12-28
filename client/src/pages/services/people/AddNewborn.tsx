"use client";

import { Loader } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface FormData {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  householdCode: string;
  relationshipToHead: string;
  address: string;
  status: "Thường trú" | "Tạm trú" | "";
  permanentResidenceDate: string;
  nationality: string;
  cccd: string;
  cmndCccdIssueDate: string;
  cmndCccdIssuePlace: string;
  occupation: string;
  workplace: string;
}

interface FormErrors {
  [key: string]: string;
}

const REQUIRED_FIELDS: (keyof FormData)[] = [
  "fullName",
  "dateOfBirth",
  "gender",
  "householdCode",
  "relationshipToHead",
  "address",
  "status",
];

export default function AddNewborn() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    householdCode: "",
    relationshipToHead: "",
    address: "",
    status: "",
    permanentResidenceDate: "",
    nationality: "Việt Nam",
    cccd: "",
    cmndCccdIssueDate: "",
    cmndCccdIssuePlace: "",
    occupation: "",
    workplace: "",
  });

  const filledRequiredFields = useMemo(() => {
    return REQUIRED_FIELDS.filter((field) => {
      const value = formData[field];
      return value && value.toString().trim() !== "";
    }).length;
  }, [formData]);

  const progressPercentage = Math.round(
    (filledRequiredFields / REQUIRED_FIELDS.length) * 100
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

  const validateForm = () => {
    const newErrors: FormErrors = {};

    REQUIRED_FIELDS.forEach((field) => {
      const value = formData[field];
      if (!value || value.toString().trim() === "") {
        newErrors[field] = "Trường này là bắt buộc";
      }
    });

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

    if (formData.cccd && formData.cccd.length < 9) {
      newErrors.cccd = "CCCD phải có ít nhất 9 chữ số";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
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
          Các trường nghề nghiệp, CCCD, nơi làm việc... là tuỳ chọn cho trẻ mới
          sinh, có thể bổ sung sau khi cấp giấy tờ. Vui lòng điền đủ thông tin
          hộ gia đình để hệ thống gán trẻ vào đúng hộ.
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
              label="Quốc tịch/Dân tộc"
              value={formData.nationality}
              onChange={(v) => handleInputChange("nationality", v)}
              placeholder="VD: Việt Nam"
            />
          </div>
        </div>

        {/* Thông tin hộ gia đình */}
        <div className="space-y-4 border-t border-second/20 dark:border-second/30 pt-6">
          <SectionTitle title="2. Thông tin hộ gia đình" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Mã hộ gia đình"
              required
              value={formData.householdCode}
              onChange={(v) => handleInputChange("householdCode", v)}
              error={errors.householdCode}
              placeholder="Nhập mã hộ hiện hữu"
            />
            <FormField
              label="Quan hệ với chủ hộ"
              required
              value={formData.relationshipToHead}
              onChange={(v) => handleInputChange("relationshipToHead", v)}
              error={errors.relationshipToHead}
              placeholder="VD: Con, Cháu"
            />
          </div>

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
              options={["Thường trú", "Tạm trú"]}
              value={formData.status}
              onChange={(v) => handleInputChange("status", v)}
              error={errors.status}
            />
            <FormField
              label="Ngày đăng ký thường trú (tuỳ chọn)"
              type="date"
              value={formData.permanentResidenceDate}
              onChange={(v) => handleInputChange("permanentResidenceDate", v)}
              error={errors.permanentResidenceDate}
            />
          </div>
        </div>

        {/* Thông tin bổ sung (tuỳ chọn) */}
        <div className="space-y-4 border-t border-second/20 dark:border-second/30 pt-6">
          <SectionTitle title="3. Thông tin bổ sung (không bắt buộc)" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="CCCD/CMND (nếu có)"
              value={formData.cccd}
              onChange={(v) => handleInputChange("cccd", v)}
              error={errors.cccd}
              placeholder="Bỏ trống nếu chưa cấp"
            />
            <FormField
              label="Nghề nghiệp (nếu có)"
              value={formData.occupation}
              onChange={(v) => handleInputChange("occupation", v)}
              placeholder="Bỏ trống cho trẻ sơ sinh"
            />
            <FormField
              label="Nơi làm việc (nếu có)"
              value={formData.workplace}
              onChange={(v) => handleInputChange("workplace", v)}
              placeholder="Bỏ trống cho trẻ sơ sinh"
            />
            <FormField
              label="Ngày cấp CCCD/CMND (nếu có)"
              type="date"
              value={formData.cmndCccdIssueDate}
              onChange={(v) => handleInputChange("cmndCccdIssueDate", v)}
              error={errors.cmndCccdIssueDate}
            />
            <FormField
              label="Nơi cấp (nếu có)"
              value={formData.cmndCccdIssuePlace}
              onChange={(v) => handleInputChange("cmndCccdIssuePlace", v)}
              placeholder="Cơ quan cấp (để trống nếu chưa có)"
            />
          </div>
        </div>

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
            className="px-6 py-2.5 rounded-lg font-medium border border-second/40 dark:border-second/30 bg-third text-first hover:bg-emerald-400 dark:hover:bg-emerald-500 hover:border-emerald-300 dark:hover:border-emerald-400 disabled:opacity-50 flex items-center gap-2 transition-colors"
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





