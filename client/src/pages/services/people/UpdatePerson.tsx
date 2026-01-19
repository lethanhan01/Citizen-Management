"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Pencil,
  X,
  Save,
  UserX,
  HeartPulse,
  Loader,
  Check,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import * as PersonAPI from "@/api/person.api";
import type { UnknownRecord } from "@/types/api";
import { usePersonStore } from "@/stores/person.store";
import { useCitizenListParams } from "@/hooks/useCitizenListParams";
import PaginationBar from "@/components/PaginationBar";

type Status = "Thường trú" | "Tạm trú" | "Tạm vắng" | "Đã chuyển đi";

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
  start_date?: string;
  end_date?: string;
}

interface FormErrors {
  [key: string]: string;
}

// Helper: Format ngày tháng
const formatDate = (dateString?: string) => {
  if (!dateString || dateString === 'N/A') return '-';
  try {
    return new Date(dateString).toLocaleDateString('vi-VN');
  } catch {
    return dateString;
  }
};

// Helpers: map BE data ↔ FE view model
function mapGenderToView(g: string | null | undefined): "Nam" | "Nữ" {
  if (!g) return "Nam";
  const val = String(g).toLowerCase();
  return val.startsWith("m") || val.includes("nam") ? "Nam" : "Nữ";
}
function mapStatusToView(s: string | null | undefined): Status {
  if (!s) return "Thường trú"; // Default to "Thường trú" nếu null/undefined
  
  const val = String(s).toLowerCase().trim();
  console.log("mapStatusToView input:", s, "normalized:", val);
  
  if (val === "permanent") return "Thường trú";
  if (val === "temporary") return "Tạm trú";
  if (val === "temporary_resident") return "Tạm trú";
  // Backend trả về "temporary_absent" (không có "e"), cần check cả 2 trường hợp
  if (val === "temporary_absence" || val === "temporary_absent") return "Tạm vắng";
  if (val === "moved_out" || val === "deceased") return "Đã chuyển đi";
  
  // Log warning nếu value không match
  console.warn("Unexpected residency_status value:", s);
  return "Thường trú"; // Default fallback
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

function toCitizenItem(p: UnknownRecord): CitizenItem {
  const households = (p as { households?: unknown }).households;
  const firstHousehold = Array.isArray(households) && households.length > 0 ? households[0] : null;
  const memberships = (p as { householdMemberships?: unknown }).householdMemberships;
  const relation = Array.isArray(memberships) && memberships.length > 0
    ? (memberships[0] as { relation_to_head?: unknown })?.relation_to_head
    : undefined;
  const isHead = Boolean((firstHousehold as { HouseholdMembership?: { is_head?: unknown } })?.HouseholdMembership?.is_head);
  
  console.log("toCitizenItem raw data:", {
    residency_status: p?.residency_status,
    all_keys: Object.keys(p || {}),
  });
  
  return {
    id: String((p as { person_id?: unknown; id?: unknown }).person_id ?? (p as { id?: unknown }).id ?? ""),
    cccd: String((p as { citizen_id_num?: unknown }).citizen_id_num ?? ""),
    fullName: String((p as { full_name?: unknown }).full_name ?? ""),
    dateOfBirth: String((p as { dob?: unknown }).dob ?? ""),
    gender: mapGenderToView((p as { gender?: string | null }).gender),
    householdCode: String((firstHousehold as { household_no?: unknown })?.household_no ?? ""),
    address: String((firstHousehold as { address?: unknown })?.address ?? ""),
    status: mapStatusToView((p as { residency_status?: string | null }).residency_status),
    nationality: String((p as { ethnicity?: unknown }).ethnicity ?? ""),
    occupation: String((p as { occupation?: unknown }).occupation ?? ""),
    workplace: String((p as { workplace?: unknown }).workplace ?? ""),
    cmndCccdIssueDate: String((p as { citizen_id_issued_date?: unknown }).citizen_id_issued_date ?? ""),
    cmndCccdIssuePlace: String((p as { citizen_id_issued_place?: unknown }).citizen_id_issued_place ?? ""),
    permanentResidenceDate: String((p as { residence_registered_date?: unknown }).residence_registered_date ?? ""),
    isDeceased: String((p as { residency_status?: unknown }).residency_status ?? "").toLowerCase() === "deceased",
    relationshipToHead: relation ? String(relation) : "",
    isHead,
    start_date: String((p as { start_date?: unknown }).start_date ?? ""),
    end_date: String((p as { end_date?: unknown }).end_date ?? ""),
  };
}

function mapGenderToServer(g: "Nam" | "Nữ"): string {
  return g === "Nam" ? "male" : "female";
}
function mapStatusToServer(s: Status, isDeceased?: boolean): string {
  if (isDeceased) return "deceased";
  if (s === "Thường trú") return "permanent";
  if (s === "Tạm trú") return "temporary_resident";
  // Backend dùng "temporary_absent" (không có "e")
  if (s === "Tạm vắng") return "temporary_absent";
  return "moved_out";
}
function toUpdatePayload(form: CitizenItem) {
  const payload: Record<string, unknown> = {
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
  const [searchParams] = useSearchParams();
  const [citizens, setCitizens] = useState<CitizenItem[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CitizenItem | null>(null);
  const [formData, setFormData] = useState<CitizenItem | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState<boolean>(false);

  // Use same data source + server-side pagination as CitizenList
  const LIMIT = 10; // Limited page size like ViewCitizen
  const [page, setPage] = useState(1);
  const { data, loading: listLoading, error: listError, pagination, fetchPersons } = usePersonStore();
  const params = useCitizenListParams({
    page,
    limit: LIMIT,
    searchQuery: search,
    sortBy: "name",
    filterGender: "all",
    filterStatus: "all",
  });

  // Get query params
  const searchQuery = searchParams.get("search") || "";
  const citizenId = searchParams.get("citizenId");

  useEffect(() => {
    // Fetch via store (same as CitizenList)
    fetchPersons(params);
    // Seed search from query param once
    if (searchQuery) {
      setSearch(searchQuery);
    }
  }, [params, fetchPersons, searchQuery]);

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  // Auto-select citizen if citizenId provided
  useEffect(() => {
    if (citizenId && citizens.length > 0) {
      const foundCitizen = citizens.find((c) => c.id === citizenId);
      if (foundCitizen) {
        setSelected(foundCitizen);
        setFormData({ ...foundCitizen });
        setErrors({});
      }
    }
  }, [citizenId, citizens]);

  // Map store data -> local view model; server handles filter/paginate
  useEffect(() => {
    const raw = Array.isArray(data) ? data : [];
    setCitizens(raw.map(toCitizenItem));
  }, [data]);

  const startEdit = (citizen: CitizenItem) => {
    console.log("startEdit called with citizen:", citizen);
    console.log("citizen.status:", citizen.status);
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

  // Determine available status options based on ORIGINAL/SELECTED status (from DB), not form state
  const getAvailableStatusOptions = (): Status[] => {
    if (!selected) return [];
    if (selected.isDeceased) return []; // No options if deceased
    
    const originalStatus = selected.status; // Status từ DB, không phải formData
    
    if (originalStatus === "Thường trú") {
      return ["Thường trú", "Đã chuyển đi"];
    } else if (originalStatus === "Tạm trú") {
      return ["Tạm trú", "Đã chuyển đi"];
    } else if (originalStatus === "Tạm vắng") {
      return []; // Chỉ xem, không cho chỉnh sửa status
    } else if (originalStatus === "Đã chuyển đi") {
      return []; // Không có option nào nếu đã là "Đã chuyển đi"
    }
    
    return [];
  };

  const validate = () => {
    if (!formData) return false;
    const newErrors: FormErrors = {};
    const required: (keyof CitizenItem)[] = [
      "fullName",
      "dateOfBirth",
      "gender",
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

    // Gỡ bỏ error nếu status được chỉnh sửa hợp lệ (có giá trị)
    if (formData.status && formData.status.trim() !== "") {
      delete newErrors.status;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveChanges = async () => {
    console.log("saveChanges called, formData:", formData);
    if (!formData) {
      console.log("formData is null");
      return;
    }
    const isValid = validate();
    console.log("validate result:", isValid, "errors:", errors);
    if (!isValid) {
      console.log("Validation failed, stopping save");
      return;
    }
    
    setSaving(true);
    try {
      const payload = toUpdatePayload(formData);
      console.log("Sending payload:", payload);
      await PersonAPI.updatePerson(formData.id, payload);
      console.log("Update successful, fetching fresh data");
      
      // Optionally refresh single item from BE
      const fresh = await PersonAPI.getPersonById(formData.id);
      const mapped = fresh ? toCitizenItem(fresh) : formData;
      setCitizens((prev) => prev.map((c) => (c.id === mapped.id ? mapped : c)));
      setSelected(mapped);
      setFormData(mapped);
      // Close the drawer after successful save
      console.log("Closing drawer");
      closeDrawer();
    } catch (e: unknown) {
      console.error("Save error:", e);
      alert(getErrorMessage(e, "Cập nhật thất bại"));
    } finally {
      setSaving(false);
    }
  };

  const markMovedAway = () => {
    if (!formData) return;
    // Chỉ update form state, không gửi API ngay
    const updatedLocal = { ...formData, status: "Đã chuyển đi" as Status };
    setFormData(updatedLocal);
  };

  const toggleDeceased = () => {
    if (!formData || !selected) return;
    // Chỉ update form state, không gửi API ngay - đợi user bấm Save
    const nextDeceased = !formData.isDeceased;
    // Khi đánh dấu đã chết, tự động đổi status thành "Đã chuyển đi"
    // Khi bỏ đánh dấu, restore về status ban đầu từ DB (selected.status)
    const updatedLocal = { 
      ...formData, 
      isDeceased: nextDeceased, 
      status: nextDeceased ? "Đã chuyển đi" as Status : selected.status 
    };
    setFormData(updatedLocal);
  };

  const isBusy = saving;

  return (
    <div className="space-y-6">
      
      {/* Search */}
      <div className="mb-6">
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

      {/* Table Container */}
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {listLoading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader className="w-5 h-5 animate-spin" />
              <span className="text-first dark:text-darkmodetext">Đang tải dữ liệu…</span>
            </div>
          </div>
        ) : listError ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center text-red-500">{listError}</div>
          </div>
        ) : citizens.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center text-second dark:text-darkmodetext/70">
              Không tìm thấy kết quả
            </div>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto flex-1">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-second dark:text-darkmodetext/70 border-b border-second/20 dark:border-second/30 bg-second/5 dark:bg-second/10">
                    <th className="py-3 px-4">Họ tên</th>
                    <th className="py-3 px-4">CCCD</th>
                    <th className="py-3 px-4">Mã hộ</th>
                    <th className="py-3 px-4">Địa chỉ</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-center">Sửa</th>
                  </tr>
                </thead>
                <tbody>
                  {citizens.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-second/10 dark:border-second/20 hover:bg-second/5 dark:hover:bg-second/10 transition"
                    >
                      <td className="py-3 px-4 font-medium text-first dark:text-darkmodetext">
                        {c.fullName}
                      </td>
                      <td className="py-3 px-4 text-first dark:text-darkmodetext">{c.cccd}</td>
                      <td className="py-3 px-4 text-first dark:text-darkmodetext">{c.householdCode}</td>
                      <td className="py-3 px-4 text-first dark:text-darkmodetext">{c.address}</td>
                      <td className="py-3 px-4">
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
                      <td className="py-3 px-4 text-center">
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
                </tbody>
              </table>
            </div>

            {/* Pagination at bottom */}
            {pagination && (
              <PaginationBar
                currentPage={pagination.currentPage ?? page}
                totalPages={pagination.totalPages ?? 1}
                totalItems={pagination.totalItems ?? 0}
                startIdx={((pagination.currentPage ?? page) - 1) * (pagination.itemsPerPage ?? LIMIT)}
                pageSize={pagination.itemsPerPage ?? LIMIT}
                currentCount={citizens.length}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </>
        )}
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
                  <div>
                    <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-1">
                      Tình trạng cư trú
                    </label>
                    {getAvailableStatusOptions().length === 0 ? (
                      <div className="px-3 py-2.5 rounded-lg border border-second/40 dark:border-second/30 bg-gray-100 dark:bg-gray-800 text-second dark:text-darkmodetext/70 text-sm">
                        {formData.status}
                      </div>
                    ) : (
                      <select
                        value={formData.status}
                        onChange={(e) => handleChange("status", e.target.value as Status)}
                        className={`w-full px-3 py-2.5 rounded-lg border border-border bg-card text-card-foreground focus:outline-none focus:ring-1 focus:ring-selectring transition ${errors.status ? "border-red-500" : ""}`}
                      >
                        {getAvailableStatusOptions().map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status}</p>}
                  </div>
                  <Field
                    label="Ngày đăng ký thường trú"
                    type="date"
                    value={formData.permanentResidenceDate || ""}
                    onChange={(v) => handleChange("permanentResidenceDate", v)}
                    error={errors.permanentResidenceDate}
                  />
                </div>

                {/* Hiển thị thời hạn Tạm trú/Tạm vắng */}
                {(formData.status === "Tạm trú" || formData.status === "Tạm vắng") && (
                  <div className="space-y-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-400">
                      {formData.status === "Tạm trú"
                        ? "Thời hạn Tạm trú"
                        : "Thời hạn Tạm vắng"}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-1">
                          Từ ngày
                        </label>
                        <div className="px-3 py-2.5 rounded-lg border border-second/40 dark:border-second/30 bg-muted/50 text-foreground text-sm">
                          {formatDate(formData.start_date)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-1">
                          Đến ngày
                        </label>
                        <div className="px-3 py-2.5 rounded-lg border border-second/40 dark:border-second/30 bg-muted/50 text-foreground text-sm">
                          {formatDate(formData.end_date)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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

                <div className="flex items-center gap-2 text-sm text-first dark:text-darkmodetext">
                  {formData.isHead ? (
                    <>
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span>Là chủ hộ</span>
                    </>
                  ) : (
                    <span className="text-second dark:text-darkmodetext/60">Không phải chủ hộ</span>
                  )}
                </div>
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
                  <UserX className="w-4 h-4" />
                  Chuyển đi nơi khác
                </button>
                <button
                  onClick={toggleDeceased}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 text-first dark:text-darkmodetext hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-60 transition-colors"
                  type="button"
                  disabled={isBusy}
                >
                  <HeartPulse className="w-4 h-4" />
                  {formData.isDeceased ? "Bỏ đánh dấu đã qua đời" : "Đánh dấu đã qua đời"}
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





