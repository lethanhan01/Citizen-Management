"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Pencil,
  X,
  Save,
  UserX,
  HeartPulse,
} from "lucide-react";

type Status = "Thường trú" | "Tạm trú" | "Đã chuyển đi";

interface CitizenItem {
  id: string;
  cccd: string;
  fullName: string;
  dateOfBirth: string;
  gender: "Nam" | "Nữ";
  householdCode: string;
  address: string;
  status: Status;
  nationality?: string;
  occupation?: string;
  workplace?: string;
  cmndCccdIssueDate?: string;
  cmndCccdIssuePlace?: string;
  permanentResidenceDate?: string;
  isDeceased?: boolean;
  relationshipToHead?: string;
  isHead?: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const MOCK_CITIZENS: CitizenItem[] = [
  {
    id: "1",
    cccd: "012345678901",
    fullName: "Nguyễn Văn A",
    dateOfBirth: "1990-05-12",
    gender: "Nam",
    householdCode: "HK001",
    address: "123 Lê Lợi, Quận 1, TP.HCM",
    status: "Thường trú",
    nationality: "Việt Nam",
    occupation: "Kỹ sư phần mềm",
    workplace: "Công ty ABC",
    cmndCccdIssueDate: "2018-06-01",
    cmndCccdIssuePlace: "TP.HCM",
    permanentResidenceDate: "2015-09-10",
    relationshipToHead: "Chủ hộ",
    isHead: true,
    isDeceased: false,
  },
  {
    id: "2",
    cccd: "098765432109",
    fullName: "Trần Thị B",
    dateOfBirth: "1995-11-23",
    gender: "Nữ",
    householdCode: "HK002",
    address: "45 Nguyễn Trãi, Hà Nội",
    status: "Tạm trú",
    nationality: "Việt Nam",
    occupation: "Nhân viên kế toán",
    workplace: "Công ty DEF",
    cmndCccdIssueDate: "2019-02-15",
    cmndCccdIssuePlace: "Hà Nội",
    permanentResidenceDate: "2017-03-20",
    relationshipToHead: "Vợ",
    isHead: false,
    isDeceased: false,
  },
  {
    id: "3",
    cccd: "123456789012",
    fullName: "Phạm Văn C",
    dateOfBirth: "1988-03-05",
    gender: "Nam",
    householdCode: "HK003",
    address: "88 Hai Bà Trưng, Đà Nẵng",
    status: "Thường trú",
    nationality: "Việt Nam",
    occupation: "Tài xế",
    workplace: "Hãng vận tải GHI",
    cmndCccdIssueDate: "2016-10-01",
    cmndCccdIssuePlace: "Đà Nẵng",
    permanentResidenceDate: "2014-01-01",
    relationshipToHead: "Chồng",
    isHead: false,
    isDeceased: false,
  },
];

export default function UpdatePerson() {
  const [citizens, setCitizens] = useState<CitizenItem[]>(MOCK_CITIZENS);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CitizenItem | null>(null);
  const [formData, setFormData] = useState<CitizenItem | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return citizens;
    return citizens.filter((c) =>
      [c.fullName, c.cccd, c.householdCode]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [citizens, search]);

  const startEdit = (citizen: CitizenItem) => {
    setSelected(citizen);
    setFormData({ ...citizen });
    setErrors({});
  };

  const closeDrawer = () => {
    setSelected(null);
    setFormData(null);
    setErrors({});
  };

  const handleChange = (field: keyof CitizenItem, value: string | boolean) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
    if (errors[field as string]) {
      const copy = { ...errors };
      delete copy[field as string];
      setErrors(copy);
    }
  };

  const validate = () => {
    if (!formData) return false;
    const newErrors: FormErrors = {};
    const required: (keyof CitizenItem)[] = [
      "fullName",
      "dateOfBirth",
      "gender",
      "cccd",
      "address",
      "status",
    ];

    required.forEach((field) => {
      const val = formData[field];
      if (!val || val.toString().trim() === "") {
        newErrors[field as string] = "Bắt buộc";
      }
    });

    if (formData.cccd && formData.cccd.length < 9) {
      newErrors.cccd = "CCCD phải ≥ 9 ký tự";
    }

    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      if (dob > new Date()) newErrors.dateOfBirth = "Ngày sinh không hợp lệ";
    }

    if (formData.permanentResidenceDate && formData.dateOfBirth) {
      const reg = new Date(formData.permanentResidenceDate);
      const dob = new Date(formData.dateOfBirth);
      if (reg < dob) newErrors.permanentResidenceDate = "Ngày đăng ký phải sau ngày sinh";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveChanges = () => {
    if (!formData || !validate()) return;
    setCitizens((prev) => prev.map((c) => (c.id === formData.id ? formData : c)));
    setSelected(formData);
  };

  const markMovedAway = () => {
    if (!formData) return;
    const updated = { ...formData, status: "Đã chuyển đi" as Status };
    setCitizens((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelected(updated);
    setFormData(updated);
  };

  const toggleDeceased = () => {
    if (!formData) return;
    const updated = { ...formData, isDeceased: !formData.isDeceased };
    setCitizens((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelected(updated);
    setFormData(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Search */}
      <div className="space-y-4 mb-6">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, CCCD..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full pl-10 pr-4 py-2.5 rounded-lg
              bg-white dark:bg-transparent dark:border
              border border-second/40 dark:border-second/30
              text-first dark:text-darkmodetext
              placeholder:text-second dark:placeholder:text-darkmodetext/40
              focus:outline-none focus:ring-1 focus:ring-selectring transition
            "
          />
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-second dark:text-darkmodetext/60" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-second dark:text-darkmodetext/70 border-b border-second/20 dark:border-second/30">
                <th className="py-3 px-2">Họ tên</th>
                <th className="py-3 px-2">CCCD</th>
                <th className="py-3 px-2">Mã hộ</th>
                <th className="py-3 px-2">Địa chỉ</th>
                <th className="py-3 px-2">Trạng thái</th>
                <th className="py-3 px-2 text-center">Sửa</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-second/10 dark:border-second/20 hover:bg-second/10 dark:hover:bg-second/20 transition"
                >
                  <td className="py-3 px-2 font-medium text-first dark:text-darkmodetext">
                    {c.fullName}
                  </td>
                  <td className="py-3 px-2 text-first dark:text-darkmodetext">{c.cccd}</td>
                  <td className="py-3 px-2 text-first dark:text-darkmodetext">{c.householdCode}</td>
                  <td className="py-3 px-2 text-first dark:text-darkmodetext">{c.address}</td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        c.status === "Thường trú"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : c.status === "Tạm trú"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-gray-200 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => startEdit(c)}
                      className="p-2 rounded-lg border border-second/30 hover:bg-second/20 dark:hover:bg-second/30 text-first dark:text-darkmodetext"
                      aria-label="Chỉnh sửa"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="py-4 text-center text-second dark:text-darkmodetext/70" colSpan={6}>
                    Không tìm thấy kết quả
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {selected && formData && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="flex-1 bg-black/40 dark:bg-black/50"
            onClick={closeDrawer}
          />
          <div className="w-full md:w-[45%] lg:w-[38%] h-full bg-card text-card-foreground border-l border-border p-6 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-first dark:text-darkmodetext">
                Chỉnh sửa thông tin
              </h3>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-lg hover:bg-second/10 dark:hover:bg-second/30"
              >
                <X className="w-5 h-5 text-first dark:text-darkmodetext" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic */}
              <Section title="Thông tin cơ bản">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Họ và tên"
                    value={formData.fullName}
                    onChange={(v) => handleChange("fullName", v)}
                    error={errors.fullName}
                  />
                  <Field
                    label="Ngày sinh"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(v) => handleChange("dateOfBirth", v)}
                    error={errors.dateOfBirth}
                  />
                  <Field
                    label="Giới tính"
                    type="select"
                    options={["Nam", "Nữ"]}
                    value={formData.gender}
                    onChange={(v) => handleChange("gender", v)}
                    error={errors.gender}
                  />
                  <Field
                    label="CCCD/CMND"
                    value={formData.cccd}
                    onChange={(v) => handleChange("cccd", v)}
                    error={errors.cccd}
                  />
                  <Field
                    label="Quốc tịch/Dân tộc"
                    value={formData.nationality || ""}
                    onChange={(v) => handleChange("nationality", v)}
                  />
                </div>
              </Section>

              {/* Work */}
              <Section title="Công việc">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Nghề nghiệp"
                    value={formData.occupation || ""}
                    onChange={(v) => handleChange("occupation", v)}
                  />
                  <Field
                    label="Nơi làm việc"
                    value={formData.workplace || ""}
                    onChange={(v) => handleChange("workplace", v)}
                  />
                </div>
              </Section>

              {/* ID docs */}
              <Section title="Giấy tờ chứng thực">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Ngày cấp"
                    type="date"
                    value={formData.cmndCccdIssueDate || ""}
                    onChange={(v) => handleChange("cmndCccdIssueDate", v)}
                  />
                  <Field
                    label="Nơi cấp"
                    value={formData.cmndCccdIssuePlace || ""}
                    onChange={(v) => handleChange("cmndCccdIssuePlace", v)}
                  />
                </div>
              </Section>

              {/* Residence */}
              <Section title="Thường trú">
                <Field
                  label="Địa chỉ"
                  type="textarea"
                  value={formData.address}
                  onChange={(v) => handleChange("address", v)}
                  error={errors.address}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Tình trạng cư trú"
                    type="select"
                    options={["Thường trú", "Tạm trú", "Đã chuyển đi"]}
                    value={formData.status}
                    onChange={(v) => handleChange("status", v as Status)}
                    error={errors.status}
                  />
                  <Field
                    label="Ngày đăng ký thường trú"
                    type="date"
                    value={formData.permanentResidenceDate || ""}
                    onChange={(v) => handleChange("permanentResidenceDate", v)}
                    error={errors.permanentResidenceDate}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Mã hộ gia đình"
                    value={formData.householdCode}
                    onChange={(v) => handleChange("householdCode", v)}
                  />
                  <Field
                    label="Quan hệ với chủ hộ"
                    value={formData.relationshipToHead || ""}
                    onChange={(v) => handleChange("relationshipToHead", v)}
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-first dark:text-darkmodetext">
                  <input
                    type="checkbox"
                    checked={formData.isHead || false}
                    onChange={(e) => handleChange("isHead", e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  Đánh dấu là chủ hộ
                </label>
              </Section>

              {/* Status toggles */}
              <Section title="Trạng thái đặc biệt">
                <label className="flex items-center gap-2 text-sm text-first dark:text-darkmodetext">
                  <input
                    type="checkbox"
                    checked={formData.isDeceased || false}
                    onChange={toggleDeceased}
                    className="w-4 h-4 rounded"
                  />
                  Đã qua đời
                </label>
                <p className="text-xs text-second dark:text-darkmodetext/60">
                  "Chuyển đi nơi khác" sẽ đổi trạng thái sang Đã chuyển đi và vẫn giữ hồ sơ.
                </p>
              </Section>

              <div className="flex flex-col sm:flex-row gap-3 justify-end border-t border-second/20 dark:border-second/30 pt-4">
                <button
                  onClick={markMovedAway}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 text-first dark:text-darkmodetext hover:bg-second/10 dark:hover:bg-second/30"
                  type="button"
                >
                  <UserX className="w-4 h-4" />
                  Chuyển đi nơi khác
                </button>
                <button
                  onClick={toggleDeceased}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 text-first dark:text-darkmodetext hover:bg-second/10 dark:hover:bg-second/30"
                  type="button"
                >
                  <HeartPulse className="w-4 h-4" />
                  Đánh dấu đã qua đời
                </button>
                <button
                  onClick={saveChanges}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-third text-first hover:bg-third/90"
                  type="button"
                >
                  <Save className="w-4 h-4" />
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-first dark:text-darkmodetext">{title}</h4>
      {children}
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: "text" | "date" | "textarea" | "select";
  options?: string[];
  error?: string;
}

function Field({ label, value, onChange, type = "text", options, error }: FieldProps) {
  const base = `
    w-full px-3 py-2 rounded-lg
    bg-white dark:bg-transparent dark:border
    border ${error ? "border-red-500" : "border-second/40 dark:border-second/30"}
    text-first dark:text-darkmodetext
    placeholder:text-second dark:placeholder:text-darkmodetext/40
    focus:outline-none focus:ring-1 focus:ring-selectring
  `;

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-first dark:text-darkmodetext">{label}</label>
      {type === "textarea" ? (
        <textarea
          className={base}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : type === "select" ? (
        <select
          className={base}
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
          className={base}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}





