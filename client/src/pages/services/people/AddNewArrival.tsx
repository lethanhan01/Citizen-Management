"use client";

import { Loader } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
// Navigation not needed; we stay on page after save
import { search as searchApi } from "@/api/search.api";
import { createHousehold, addPersonToHousehold } from "@/api/household.api";
import type { UnknownRecord } from "@/types/api";

interface FormData {
  fullName: string;
  alias: string;
  dateOfBirth: string;
  gender: string;
  cccd: string;
  nationality: string;
  birthplace: string;
  hometown: string;
  occupation: string;
  workplace: string;
  cmndCccdIssueDate: string;
  cmndCccdIssuePlace: string;
  address: string;
  householdCode: string;
  permanentResidenceDate: string;
  relationshipToHead: string;
  previousAddress: string;
  note: string;
  arrivalType?: "newborn" | "arrival";
}

interface FormErrors {
  [key: string]: string;
}

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err && typeof err === "object") {
    const responseMessage = (err as { response?: { data?: { message?: unknown } } }).response?.data
      ?.message;
    if (typeof responseMessage === "string" && responseMessage.trim()) return responseMessage;
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  return fallback;
};

// Helper to generate a fresh initial form state
const createInitialFormData = (): FormData => ({
  fullName: "",
  alias: "",
  dateOfBirth: "",
  gender: "",
  cccd: "",
  nationality: "",
  birthplace: "",
  hometown: "",
  occupation: "",
  workplace: "",
  cmndCccdIssueDate: "",
  cmndCccdIssuePlace: "",
  address: "",
  householdCode: "",
  permanentResidenceDate: "",
  relationshipToHead: "",
  previousAddress: "",
  note: "",
  // arrivalType intentionally left undefined until user selects
});

const REQUIRED_FIELDS: (keyof FormData)[] = [
  "fullName",
  "dateOfBirth",
  "gender",
  "nationality",
  "birthplace",
  "hometown",
  "address",
  "permanentResidenceDate",
  "relationshipToHead",
  "arrivalType",
];

export default function AddNewArrival() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>(createInitialFormData());
  const [isLookupAddress, setIsLookupAddress] = useState(false);
  const [resolvedHouseholdId, setResolvedHouseholdId] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [formKey, setFormKey] = useState(0);

  const scrollToTop = () => {
    try {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      const se = (document.scrollingElement || document.documentElement) as HTMLElement | null;
      if (se && "scrollTo" in se) {
        se.scrollTo({ top: 0, behavior: "smooth" });
      }
      if (se) se.scrollTop = 0;
    } catch {
      // no-op
    }
  };

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
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại các trường bắt buộc!");
      return;
    }

    setIsLoading(true);
    try {
      // 1) Resolve householdId: from lookup or by creating new household if not provided
      let householdId = resolvedHouseholdId;

      // If user entered a code but we couldn't resolve yet, try resolving again
      if (!householdId && formData.householdCode?.trim()) {
        const code = formData.householdCode.trim();
        const data = await searchApi({ household_no: code, limit: 1, page: 1 });
        const first = Array.isArray(data?.data) ? data.data[0] : null;
        const households: UnknownRecord[] = Array.isArray((first as UnknownRecord)?.households)
          ? (((first as UnknownRecord).households ?? []) as UnknownRecord[])
          : Array.isArray((first as UnknownRecord)?.Households)
          ? (((first as UnknownRecord).Households ?? []) as UnknownRecord[])
          : [];
        const match = households.find((h: UnknownRecord) => (h.household_no || h.householdNo) === code) || households[0];
        const hid = (match as { household_id?: unknown; householdId?: unknown; id?: unknown })?.household_id ||
          (match as { householdId?: unknown })?.householdId ||
          (match as { id?: unknown })?.id;
        if (hid) {
          householdId = String(hid);
        } else {
          setErrors((prev) => ({ ...prev, householdCode: "Mã hộ không tồn tại" }));
          return;
        }
      }

      // If no code provided, create a new household
      if (!householdId) {
        const newHousehold = await createHousehold({
          address: formData.address,
          // household_no omitted to let backend generate if supported
          household_type: "family",
          note: "Tạo tự động từ thêm nhân khẩu",
        });
        const hid = newHousehold?.household_id || newHousehold?.householdId || newHousehold?.id;
        if (!hid) {
          throw new Error("Không thể tạo hộ khẩu mới");
        }
        householdId = String(hid);
      }

      // 2) Map form fields to backend payload
      const event_type = formData.arrivalType === "newborn" ? "birth" : "move_in";
      const genderPayload =
        formData.gender === "Nam"
          ? "male"
          : formData.gender === "Nữ"
          ? "female"
          : formData.gender;
      const personPayload: Record<string, unknown> = {
        event_type,
        full_name: formData.fullName,
        gender: genderPayload,
        dob: formData.dateOfBirth,
        alias: formData.alias || undefined,
        birthplace: formData.birthplace || undefined,
        hometown: formData.hometown || undefined,
        ethnicity: formData.nationality,
        occupation: formData.occupation,
        workplace: formData.workplace,
        citizen_id_num: formData.cccd || undefined,
        citizen_id_issued_date: formData.cmndCccdIssueDate,
        citizen_id_issued_place: formData.cmndCccdIssuePlace,
        residency_status: "permanent",
        residence_registered_date: formData.permanentResidenceDate,
        relation_to_head: formData.relationshipToHead,
        is_head: formData.relationshipToHead?.trim() === "Chủ hộ",
        membership_type: "family_member",
        start_date: formData.permanentResidenceDate,
        previous_address:
          formData.arrivalType === "arrival" && formData.previousAddress
            ? formData.previousAddress
            : undefined,
        note: formData.note || undefined,
      };

      // 3) Call API to add person to household
      const result = await addPersonToHousehold(householdId, personPayload);

      // After successful save: reset for next entry and scroll to top
      if (result) {
        toast.success("Thêm nhân khẩu thành công!");
        resetForm();
        window.requestAnimationFrame(scrollToTop);
      }
    } catch (err: unknown) {
      console.error("Error submitting form", err);
      const message = getErrorMessage(err, "Có lỗi xảy ra khi lưu");
      setErrors((prev) => ({ ...prev, submit: message }));
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(createInitialFormData());
    setErrors({});
    setResolvedHouseholdId(null);
    setIsLookupAddress(false);
    try {
      formRef.current?.reset();
    } catch {}
    setFormKey((k) => k + 1);
  };

  const handleCancel = () => {
    // Confirm before clearing all inputs and states
    const ok = window.confirm("Bạn có chắc muốn xóa toàn bộ dữ liệu đã nhập?");
    if (!ok) return;
    resetForm();
    // Wait for DOM to settle after reset, then scroll
    window.requestAnimationFrame(scrollToTop);
  };

  const handleLookupHouseholdAddress = async () => {
    const code = formData.householdCode?.trim();
    if (!code) return;
    try {
      setIsLookupAddress(true);
      const data = await searchApi({ household_no: code, limit: 1, page: 1 });
      // data is array of persons with included households
      const first = Array.isArray(data?.data) ? data.data[0] : null;
      const households: UnknownRecord[] = Array.isArray((first as UnknownRecord)?.households)
        ? (((first as UnknownRecord).households ?? []) as UnknownRecord[])
        : Array.isArray((first as UnknownRecord)?.Households)
        ? (((first as UnknownRecord).Households ?? []) as UnknownRecord[])
        : [];
      // Try to find exact match first
      const match = households.find((h: UnknownRecord) => (h.household_no || h.householdNo) === code) || households[0];
      const addr = match?.address || match?.Address;
      const hid = (match as { household_id?: unknown; householdId?: unknown; id?: unknown })?.household_id ||
        (match as { householdId?: unknown })?.householdId ||
        (match as { id?: unknown })?.id;
      if (addr && typeof addr === "string") {
        setFormData((prev) => ({ ...prev, address: addr }));
        // Clear address error if autofilled
        if (errors.address) {
          setErrors((prev) => { const n = { ...prev }; delete n.address; return n; });
        }
      }
      if (hid) {
        setResolvedHouseholdId(String(hid));
      }
    } catch (e) {
      // ignore errors, user can fill manually
      console.warn("Lookup household address failed", e);
    } finally {
      setIsLookupAddress(false);
    }
  };

  return (
    <div ref={topRef} className="space-y-6">
      {/* --- TOASTER --- */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          className: "",
          style: {
            border: "1px solid #713200",
            padding: "16px",
            color: "#713200",
          },
        }}
      />
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
        key={formKey}
        ref={formRef}
        onSubmit={handleSubmit}
        className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm space-y-8"
      >
        <p className="text-second dark:text-darkmodetext/70">
            Vui lòng điền đầy đủ và chính xác các thông tin dưới đây. Các mục có dấu * là bắt buộc.
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
              label="Tên khác (bí danh)"
              value={formData.alias}
              onChange={(v) => handleInputChange("alias", v)}
              placeholder="Nhập bí danh nếu có"
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
            <FormField
              label="Nơi sinh"
              required
              value={formData.birthplace}
              onChange={(v) => handleInputChange("birthplace", v)}
              placeholder="Nhập nơi sinh"
            />
            <FormField
              label="Quê quán"
              required
              value={formData.hometown}
              onChange={(v) => handleInputChange("hometown", v)}
              placeholder="Nhập quê quán"
            />
            <fieldset className="space-y-2">
            <legend className="block text-sm font-medium text-first dark:text-darkmodetext">
              Loại nhân khẩu <span className="text-red-500">*</span>
            </legend>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="arrivalType"
                  value="newborn"
                  checked={formData.arrivalType === "newborn"}
                  onChange={() => handleInputChange("arrivalType", "newborn")}
                  className="sr-only peer"
                />
                <span
                  className="px-3 py-1.5 rounded-full border text-sm transition-colors
                  border-border hover:border-border active:border-2 active:border-black dark:active:border-white
                  text-first dark:text-darkmodetext bg-second/10 dark:bg-second/20
                  peer-checked:bg-third peer-checked:border-2 peer-checked:border-black dark:peer-checked:border-white
                  peer-checked:text-first
                  focus:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-selectring
                  peer-focus:border-2 peer-focus:border-black dark:peer-focus:border-white"
                >
                  Mới sinh
                </span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="arrivalType"
                  value="arrival"
                  checked={formData.arrivalType === "arrival"}
                  onChange={() => handleInputChange("arrivalType", "arrival")}
                  className="sr-only peer"
                />
                <span
                  className="px-3 py-1.5 rounded-full border text-sm transition-colors
                  border-border hover:border-border active:border-2 active:border-black dark:active:border-white
                  text-first dark:text-darkmodetext bg-second/10 dark:bg-second/20
                  peer-checked:bg-third peer-checked:border-2 peer-checked:border-black dark:peer-checked:border-white
                  peer-checked:text-first
                  focus:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-selectring
                  peer-focus:border-2 peer-focus:border-black dark:peer-focus:border-white"
                >
                  Mới đến
                </span>
              </label>
            </div>
            {errors.arrivalType && (
              <p className="text-xs text-red-500">{errors.arrivalType}</p>
            )}
            </fieldset>
          </div>
        </div>

        {/* Thông tin công việc */}
        <div className="space-y-4 border-t border-second/20 dark:border-second/30 pt-6">
          <SectionTitle title="2. Thông tin công việc" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Nghề nghiệp"
              value={formData.occupation}
              onChange={(v) => handleInputChange("occupation", v)}
              error={errors.occupation}
              placeholder="VD: Nhân viên văn phòng"
            />
            <FormField
              label="Nơi làm việc"
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
              type="date"
              value={formData.cmndCccdIssueDate}
              onChange={(v) => handleInputChange("cmndCccdIssueDate", v)}
              error={errors.cmndCccdIssueDate}
            />
            <FormField
              label="Nơi cấp"
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
            label="Mã hộ gia đình (tuỳ chọn)"
            value={formData.householdCode}
            onChange={(v) => handleInputChange("householdCode", v)}
            placeholder="Nhập mã hộ nếu muốn thêm vào hộ hiện hữu"
            helperText="Điền mã hộ để tự động điền địa chỉ (Khi nhập xong, click ra ngoài ô này để tìm)."
            onBlur={handleLookupHouseholdAddress}
          />
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
          {isLookupAddress && (
            <p className="text-xs text-second dark:text-darkmodetext/60">Đang tìm địa chỉ theo mã hộ...</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              label="Quan hệ với chủ hộ"
              required
              value={formData.relationshipToHead}
              onChange={(v) => handleInputChange("relationshipToHead", v)}
              error={errors.relationshipToHead}
              placeholder="VD: Chủ hộ, Vợ, Chồng, Con"
            />
          </div>

          {formData.arrivalType === "arrival" && (
            <FormField
              label="Địa chỉ trước đây (chỉ áp dụng cho nhân khẩu mới đến)"
              type="textarea"
              rows={3}
              value={formData.previousAddress}
              onChange={(v) => handleInputChange("previousAddress", v)}
              placeholder="Nhập địa chỉ nơi cư trú trước đây"
              helperText="Giúp ghi nhận nguồn gốc di chuyển"
            />
          )}

          <FormField
            label="Ghi chú"
            type="textarea"
            rows={2}
            value={formData.note}
            onChange={(v) => handleInputChange("note", v)}
            placeholder="Thông tin bổ sung nếu có"
          />
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
  helperText?: string;
  onBlur?: () => void;
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
  onBlur,
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
          onBlur={onBlur}
          placeholder={placeholder}
          className={baseClasses}
        />
      ) : type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
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
          onBlur={onBlur}
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





