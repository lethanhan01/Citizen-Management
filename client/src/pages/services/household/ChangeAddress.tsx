"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader, X, RefreshCw } from "lucide-react";
import * as HouseholdAPI from "@/api/household.api";
import { toast } from "react-hot-toast";

interface HouseholdItem {
  id: string;
  code: string;
  headName: string;
  headCCCD: string;
  address: string;
  memberCount: number;
}

interface FormData {
  oldAddress: string;
  newAddress: string;
}

interface FormErrors {
  [key: string]: string;
}

function toHouseholdItem(h: any): HouseholdItem {
  const headPerson = h?.headPerson || null;
  return {
    id: String(h?.household_id ?? h?.id ?? ""),
    code: String(h?.household_no ?? h?.code ?? ""),
    headName: String(headPerson?.full_name ?? h?.head_name ?? ""),
    headCCCD: String(headPerson?.citizen_id_num ?? h?.head_cccd ?? ""),
    address: String(h?.address ?? ""),
    memberCount: Number(h?.members_count ?? h?.memberCount ?? 0),
  };
}

export default function ChangeAddress() {
  const [params] = useSearchParams();
  const initialId = params.get("id") || params.get("household_no") || params.get("code") || "";
  const [householdId, setHouseholdId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHousehold, setSelectedHousehold] = useState<HouseholdItem | null>(null);
  const [formData, setFormData] = useState<FormData>({
    oldAddress: "",
    newAddress: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Fetch household by ID or code
  const fetchHousehold = async (raw: string) => {
    if (!raw.trim()) {
      setError(null);
      setSelectedHousehold(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let idForQuery = raw.trim();
      const isNumeric = /^\d+$/.test(idForQuery);
      
      if (!isNumeric) {
        // Treat input as household code, resolve to ID across all pages
        const limit = 500;
        let page = 1;
        const acc: any[] = [];
        while (true) {
          const resp = await HouseholdAPI.getHouseholds({ page, limit });
          const arr = Array.isArray(resp)
            ? resp
            : Array.isArray((resp as any)?.rows)
            ? (resp as any).rows
            : [];
          acc.push(...arr);
          if (arr.length < limit) break;
          page += 1;
          if (page > 1000) break; // safety stop
        }
        const found = acc.find(
          (h: any) => String(h?.household_no ?? h?.code ?? "").toLowerCase() === idForQuery.toLowerCase()
        );
        if (!found) {
          throw new Error(`Không tìm thấy hộ khẩu với mã: ${idForQuery}`);
        }
        idForQuery = String(found?.household_id ?? found?.id);
      }

      // Fetch household detail
      const detail = await HouseholdAPI.getHouseholdById(idForQuery);
      if (!detail) {
        throw new Error("Không tìm thấy thông tin hộ khẩu");
      }

      const household = toHouseholdItem(detail);
      setSelectedHousehold(household);
      setFormData({
        oldAddress: household.address,
        newAddress: "",
      });
      setErrors({});
      
      // Scroll to form
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (e: any) {
      setError(e?.message || "Không tìm thấy hộ khẩu");
      setSelectedHousehold(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchHousehold(initialId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  // Handle input change
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

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.newAddress || formData.newAddress.trim() === "") {
      newErrors.newAddress = "Địa chỉ mới là bắt buộc";
    } else if (formData.newAddress.trim() === formData.oldAddress.trim()) {
      newErrors.newAddress = "Địa chỉ mới phải khác địa chỉ cũ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedHousehold) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await HouseholdAPI.updateHousehold(selectedHousehold.id, {
        address: formData.newAddress.trim(),
      });
      toast.success("Thay đổi địa chỉ thành công!");

      // Refresh household data
      await fetchHousehold(selectedHousehold.id);
    } catch (e: any) {
      console.error("Error updating address:", e);
      toast.error(e?.message || "Có lỗi xảy ra khi thay đổi địa chỉ");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel - reset everything and scroll to top
  const handleCancel = () => {
    setSelectedHousehold(null);
    setFormData({
      oldAddress: "",
      newAddress: "",
    });
    setErrors({});
    setHouseholdId("");
    setError(null);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-first dark:text-darkmodetext">
            Thay đổi địa chỉ hộ
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Nhập mã hộ (HK...) hoặc ID..."
            value={householdId}
            onChange={(e) => setHouseholdId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-card text-card-foreground focus:outline-none focus:ring-1 focus:ring-selectring"
          />
          <button
            onClick={() => fetchHousehold(householdId)}
            disabled={loading || !householdId}
            className="px-4 py-2 rounded-lg bg-third text-first hover:bg-third/90 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" /> Đang tải...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" /> Tìm hộ khẩu
              </>
            )}
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {loading && !selectedHousehold && (
          <div className="flex items-center gap-2 text-second dark:text-darkmodetext/70">
            <Loader className="w-4 h-4 animate-spin" /> Đang tải thông tin hộ khẩu...
          </div>
        )}
      </div>

      {/* Form */}
      {selectedHousehold && (
        <div
          ref={formRef}
          className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-first dark:text-darkmodetext">
              Thay đổi địa chỉ hộ
            </h2>
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg hover:bg-second/10 dark:hover:bg-second/30"
              aria-label="Đóng"
            >
              <X className="w-5 h-5 text-first dark:text-darkmodetext" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Household Info */}
            <div className="bg-muted/10 dark:bg-muted/20 p-4 rounded-lg space-y-2">
              <div className="text-sm font-medium text-first dark:text-darkmodetext">
                Mã hộ: <span className="font-semibold">{selectedHousehold.code}</span>
              </div>
              <div className="text-sm text-second dark:text-darkmodetext/70">
                Chủ hộ: {selectedHousehold.headName || "—"}
              </div>
            </div>

            {/* Old Address (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                Địa chỉ cũ
              </label>
              <textarea
                value={formData.oldAddress}
                readOnly
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-second/40 dark:border-second/30 bg-gray-100 dark:bg-gray-800 text-first dark:text-darkmodetext cursor-not-allowed"
              />
            </div>

            {/* New Address */}
            <div>
              <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                Địa chỉ mới <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.newAddress}
                onChange={(e) => handleInputChange("newAddress", e.target.value)}
                rows={3}
                placeholder="Nhập địa chỉ mới..."
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.newAddress
                    ? "border-red-500"
                    : "border-second/40 dark:border-second/30"
                } bg-white dark:bg-transparent text-first dark:text-darkmodetext placeholder:text-second dark:placeholder:text-darkmodetext/40 focus:outline-none focus:ring-1 focus:ring-selectring transition`}
              />
              {errors.newAddress && (
                <p className="text-xs text-red-500 mt-1">{errors.newAddress}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="border-t border-second/20 dark:border-second/30 pt-6 flex gap-4 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg font-medium border border-second/40 dark:border-second/30 text-first dark:text-darkmodetext hover:bg-second/10 dark:hover:bg-second/30 disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg font-medium bg-third text-first hover:bg-emerald-400 dark:hover:bg-emerald-500 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
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
      )}
    </div>
  );
}

