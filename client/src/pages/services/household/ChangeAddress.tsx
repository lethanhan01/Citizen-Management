"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Loader, X } from "lucide-react";
import { useHouseholdStore } from "@/stores/household.store";
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
  const [search, setSearch] = useState("");
  const [households, setHouseholds] = useState<HouseholdItem[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState<HouseholdItem | null>(null);
  const [formData, setFormData] = useState<FormData>({
    oldAddress: "",
    newAddress: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Load households from backend
  useEffect(() => {
    const loadHouseholds = async () => {
      setListLoading(true);
      try {
        const list = await HouseholdAPI.getHouseholds({ page: 1, limit: 500 });
        const arr = Array.isArray(list) ? list : Array.isArray(list?.rows) ? list.rows : [];
        const mapped: HouseholdItem[] = arr.map(toHouseholdItem);
        setHouseholds(mapped);
      } catch (e: any) {
        console.error("Error loading households:", e);
        toast.error("Không tải được danh sách hộ khẩu");
      } finally {
        setListLoading(false);
      }
    };
    loadHouseholds();
  }, []);

  // Filter households by search query (mã hộ, tên chủ hộ, CCCD chủ hộ)
  const filteredHouseholds = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];
    return households.filter((h) =>
      h.code.toLowerCase().includes(term) ||
      h.headName.toLowerCase().includes(term) ||
      h.headCCCD.toLowerCase().includes(term)
    );
  }, [search, households]);

  // Show list only when search has value
  const showList = search.trim().length > 0;

  // Handle select household
  const handleSelectHousehold = (household: HouseholdItem) => {
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
  };

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
      
      // Refresh households list
      const list = await HouseholdAPI.getHouseholds({ page: 1, limit: 500 });
      const arr = Array.isArray(list) ? list : Array.isArray(list?.rows) ? list.rows : [];
      const mapped: HouseholdItem[] = arr.map(toHouseholdItem);
      setHouseholds(mapped);

      // Reset form
      handleCancel();
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
    setSearch("");
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      {/* Search & List */}
      <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-first dark:text-darkmodetext mb-4">
          Tìm kiếm hộ khẩu
        </h3>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Tìm theo mã hộ, tên chủ hộ, CCCD chủ hộ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-second/40 dark:border-second/30 bg-white dark:bg-transparent text-first dark:text-darkmodetext focus:outline-none focus:ring-1 focus:ring-selectring dark:placeholder:text-darkmodetext/50"
          />
          <Search className="w-5 h-5 absolute left-3 top-3 text-second dark:text-darkmodetext/50" />
        </div>

        {showList && (
          listLoading ? (
            <div className="flex items-center gap-2 text-second dark:text-darkmodetext/70">
              <Loader className="w-4 h-4 animate-spin" />
              Đang tải...
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredHouseholds.length === 0 ? (
                  <p className="text-second dark:text-darkmodetext/60 text-sm">
                    Không tìm thấy hộ khẩu
                  </p>
                ) : (
                  filteredHouseholds.map((household) => (
                    <button
                      key={household.id}
                      onClick={() => handleSelectHousehold(household)}
                      className={`w-full p-3 rounded-lg border text-left transition ${
                        selectedHousehold?.id === household.id
                          ? "bg-slate-200 dark:bg-slate-600 border-slate-300 dark:border-slate-500 text-first dark:text-white"
                          : "bg-white dark:bg-transparent border-second/20 dark:border-slate-600 text-first dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <div className="font-medium">{household.code}</div>
                      <div className="text-sm opacity-70">
                        Chủ hộ: {household.headName || "—"} | CCCD: {household.headCCCD || "—"}
                      </div>
                      <div className="text-sm opacity-70">Địa chỉ: {household.address}</div>
                    </button>
                  ))
                )}
              </div>
            </>
          )
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

