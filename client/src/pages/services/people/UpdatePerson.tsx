"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Pencil,
  X,
  Save,
  UserX,
  HeartPulse,
  Loader,
} from "lucide-react";
import * as PersonAPI from "@/api/person.api";
import { useAuthStore } from "@/stores/auth.store";

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

// Helpers: map BE data ↔ FE view model
function mapGenderToView(g: string | null | undefined): "Nam" | "Nữ" {
  if (!g) return "Nam";
  const val = String(g).toLowerCase();
  return val.startsWith("m") || val.includes("nam") ? "Nam" : "Nữ";
}
function mapStatusToView(s: string | null | undefined): Status {
  const val = String(s || "permanent").toLowerCase();
  if (val === "permanent") return "Thường trú";
  if (val === "temporary") return "Tạm trú";
  return "Đã chuyển đi";
}
function toCitizenItem(p: any): CitizenItem {
  const firstHousehold = Array.isArray(p?.households) && p.households.length > 0 ? p.households[0] : null;
  const relation = Array.isArray(p?.householdMemberships) && p.householdMemberships.length > 0 ? p.householdMemberships[0]?.relation_to_head : undefined;
  const isHead = !!(firstHousehold?.HouseholdMembership?.is_head);
  return {
    id: String(p?.person_id ?? p?.id ?? ""),
    cccd: String(p?.citizen_id_num ?? ""),
    fullName: String(p?.full_name ?? ""),
    dateOfBirth: p?.dob ?? "",
    gender: mapGenderToView(p?.gender),
    householdCode: String(firstHousehold?.household_no ?? ""),
    address: String(firstHousehold?.address ?? ""),
    status: mapStatusToView(p?.residency_status),
    nationality: String(p?.ethnicity ?? ""),
    occupation: String(p?.occupation ?? ""),
    workplace: String(p?.workplace ?? ""),
    cmndCccdIssueDate: p?.citizen_id_issued_date ?? "",
    cmndCccdIssuePlace: p?.citizen_id_issued_place ?? "",
    permanentResidenceDate: p?.residence_registered_date ?? "",
    isDeceased: String(p?.residency_status ?? "").toLowerCase() === "deceased",
    relationshipToHead: relation ?? "",
    isHead,
  };
}

function mapGenderToServer(g: "Nam" | "Nữ"): string {
  return g === "Nam" ? "male" : "female";
}
function mapStatusToServer(s: Status, isDeceased?: boolean): string {
  if (isDeceased) return "deceased";
  if (s === "Thường trú") return "permanent";
  if (s === "Tạm trú") return "temporary";
  return "moved_out";
}
function toUpdatePayload(form: CitizenItem) {
  const payload: Record<string, any> = {
    full_name: form.fullName,
    dob: form.dateOfBirth || null,
    gender: mapGenderToServer(form.gender),
    citizen_id_num: form.cccd,
    ethnicity: form.nationality || null,
    occupation: form.occupation || null,
    workplace: form.workplace || null,
    citizen_id_issued_date: form.cmndCccdIssueDate || null,
    citizen_id_issued_place: form.cmndCccdIssuePlace || null,
    residency_status: mapStatusToServer(form.status, form.isDeceased),
    residence_registered_date: form.permanentResidenceDate || null,
  };
  if (form.relationshipToHead && form.relationshipToHead.trim() !== "") {
    payload["relation_to_head"] = form.relationshipToHead;
  }
  return payload;
}

export default function UpdatePerson() {
  const [citizens, setCitizens] = useState<CitizenItem[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CitizenItem | null>(null);
  const [formData, setFormData] = useState<CitizenItem | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [moving, setMoving] = useState<boolean>(false);
  const [deceasedLoading, setDeceasedLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((s) => s.token);
  const persistedToken = useMemo(() => token || localStorage.getItem("token"), [token]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await PersonAPI.getPersons({ page: 1, limit: 100 });
        const items = Array.isArray(resp.rows) ? resp.rows.map(toCitizenItem) : [];
        setCitizens(items);
      } catch (e: any) {
        setError(e?.message || "Không tải được danh sách nhân khẩu");
      } finally {
        setLoading(false);
      }
    };

    if (!persistedToken) {
      // Chưa có token (đang hydrate hoặc chưa đăng nhập), không báo lỗi sớm
      setCitizens([]);
      return;
    }
    fetchData();
  }, [persistedToken]);

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

  const saveChanges = async () => {
    if (!formData || !validate()) return;
    setSaving(true);
    try {
      const payload = toUpdatePayload(formData);
      await PersonAPI.updatePerson(formData.id, payload);
      // Optionally refresh single item from BE
      const fresh = await PersonAPI.getPersonById(formData.id);
      const mapped = fresh ? toCitizenItem(fresh) : formData;
      setCitizens((prev) => prev.map((c) => (c.id === mapped.id ? mapped : c)));
      setSelected(mapped);
      setFormData(mapped);
      // Close the drawer after successful save
      closeDrawer();
    } catch (e: any) {
      alert(e?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const markMovedAway = async () => {
    if (!formData) return;
    setMoving(true);
    const updatedLocal = { ...formData, status: "Đã chuyển đi" as Status };
    try {
      await PersonAPI.updatePerson(formData.id, {
        residency_status: mapStatusToServer("Đã chuyển đi" as Status),
      });
      setCitizens((prev) => prev.map((c) => (c.id === updatedLocal.id ? updatedLocal : c)));
      setSelected(updatedLocal);
      setFormData(updatedLocal);
    } catch (e: any) {
      alert(e?.message || "Cập nhật trạng thái chuyển đi thất bại");
    } finally {
      setMoving(false);
    }
  };

  const toggleDeceased = async () => {
    if (!formData) return;
    setDeceasedLoading(true);
    const nextDeceased = !formData.isDeceased;
    const nextLocal = { ...formData, isDeceased: nextDeceased, status: nextDeceased ? "Đã chuyển đi" : formData.status };
    try {
      await PersonAPI.updatePerson(formData.id, {
        residency_status: nextDeceased ? "deceased" : mapStatusToServer(nextLocal.status),
      });
      setCitizens((prev) => prev.map((c) => (c.id === nextLocal.id ? nextLocal : c)));
      setSelected(nextLocal);
      setFormData(nextLocal);
    } catch (e: any) {
      alert(e?.message || "Cập nhật trạng thái qua đời thất bại");
    } finally {
      setDeceasedLoading(false);
    }
  };

  const isBusy = saving || moving || deceasedLoading;

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
              {loading && (
                <tr>
                  <td className="py-4 text-center" colSpan={6}>Đang tải dữ liệu…</td>
                </tr>
              )}
              {error && !loading && (
                <tr>
                  <td className="py-4 text-center text-red-500" colSpan={6}>{error}</td>
                </tr>
              )}
              {!loading && !error && filtered.map((c) => (
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
              {!loading && !error && filtered.length === 0 && (
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
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 text-first dark:text-darkmodetext hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-60 transition-colors"
                  type="button"
                  disabled={isBusy}
                >
                  {moving ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <UserX className="w-4 h-4" />
                      Chuyển đi nơi khác
                    </>
                  )}
                </button>
                <button
                  onClick={toggleDeceased}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 text-first dark:text-darkmodetext hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-60 transition-colors"
                  type="button"
                  disabled={isBusy}
                >
                  {deceasedLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <HeartPulse className="w-4 h-4" />
                      Đánh dấu đã qua đời
                    </>
                  )}
                </button>
                <button
                  onClick={saveChanges}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 bg-third text-first hover:bg-emerald-500 dark:hover:bg-emerald-500 hover:border-emerald-400 dark:hover:border-emerald-400 disabled:opacity-60 transition-colors"
                  type="button"
                  disabled={isBusy}
                >
                  {saving ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Lưu thay đổi
                    </>
                  )}
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





