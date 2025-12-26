"use client";

import { useNavigate } from "react-router-dom";
import { Search, Plus, Pencil, Trash2, Lock, Unlock, X, Save, Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { accountApi } from "@/api/account.api";
import type { Account, Role, Status } from "@/types/account";
import { ROLE_LABEL } from "@/types/account";



export default function AccountList() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "role" | "status">("name");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<Account | null>(null);

  // loading cho fetch list
  const [isFetching, setIsFetching] = useState(true);
  // loading cho save modal
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await accountApi.getAll();
        const list = (res.data?.data ?? []).map((u: any) => ({
          id: String(u.user_id ?? u.id),
          username: u.username ?? "",
          fullName: u.full_name ?? "",
          role: u.role ?? "accountant",
          status: "Hoạt động",          // backend chưa có status thì tạm fix cứng
          createdAt: u.createdAt ? String(u.createdAt).slice(0, 10) : "",
          email: "",
          phone: "",
          cccd: "",
        })) as Account[];

        setAccounts(list);

      } catch (e) {
        console.error("GET /accounts failed:", e);
        setAccounts([]);
      } finally {
        setIsFetching(false);
      }
    };

    fetchAccounts();
  }, []);



  const filteredAccounts = useMemo(() => {
    const term = search.trim().toLowerCase();
    let result = accounts.filter((a) =>
      [a.fullName, a.username, a.email || "", a.phone || ""].some((v) =>
        v.toLowerCase().includes(term)
      )
    );

    if (sortBy === "name") {
      result = [...result].sort((a, b) => a.fullName.localeCompare(b.fullName));
    } else if (sortBy === "role") {
      const order: Record<Role, number> = { admin: 1, staff: 2, viewer: 3 };
      result = [...result].sort((a, b) => order[a.role] - order[b.role]);
    } else if (sortBy === "status") {
      const order: Record<Status, number> = { "Hoạt động": 1, "Khóa": 2 };
      result = [...result].sort((a, b) => order[a.status] - order[b.status]);
    }

    return result;
  }, [accounts, search, sortBy]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAccounts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAccounts.map((a) => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openModal = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({ ...account, password: "" });
    } else {
      setEditingAccount(null);
      setFormData({
        id: "",
        fullName: "",
        username: "",
        role: "viewer",
        status: "Hoạt động",
        createdAt: new Date().toISOString().split("T")[0],
        email: "",
        phone: "",
        cccd: "",
        password: "123456",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(null);
    setEditingAccount(null);
  };

  const handleSave = async () => {
    if (!formData) return;
    if (!formData.fullName.trim() || !formData.username.trim()) return;

    setIsSaving(true);
    try {
      if (editingAccount) {
        const res = await accountApi.update(editingAccount.id, {
          full_name: formData.fullName,
          role: formData.role,
          ...(formData.password?.trim() ? { password: formData.password } : {}),
        });

        const u = res.data?.data;
        const mapped: Account = {
          id: String(u.user_id ?? u.id),
          username: u.username ?? formData.username,
          fullName: u.full_name ?? formData.fullName,
          role: (u.role ?? formData.role) as any,
          status: "Hoạt động",
          createdAt: u.createdAt ? String(u.createdAt).slice(0, 10) : formData.createdAt,
          email: formData.email ?? "",
          phone: formData.phone ?? "",
          cccd: formData.cccd ?? "",
        };

        setAccounts((prev) => prev.map((a) => (a.id === editingAccount.id ? mapped : a)));

      } else {
        const res = await accountApi.create({
          username: formData.username,
          password: formData.password || "123456",
          full_name: formData.fullName,
          role: formData.role,
        });

        const u = res.data?.data;
        const mapped: Account = {
          id: String(u.user_id ?? u.id),
          username: u.username ?? "",
          fullName: u.full_name ?? "",
          role: (u.role ?? "accountant") as any,
          status: "Hoạt động",
          createdAt: u.createdAt ? String(u.createdAt).slice(0, 10) : "",
          email: "",
          phone: "",
          cccd: "",
        };

        setAccounts((prev) => [mapped, ...prev]);

      }
      closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };


  const handleDelete = async (id: string) => {
    await accountApi.remove(id);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const handleBulkUnlock = () => {
    setAccounts((prev) => prev.map((a) => (selectedIds.includes(a.id) ? { ...a, status: "Hoạt động" } : a)));
  };

  const handleBulkLock = () => {
    setAccounts((prev) => prev.map((a) => (selectedIds.includes(a.id) ? { ...a, status: "Khóa" } : a)));
  };

  const handleBulkDelete = () => {
    setAccounts((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
    setSelectedIds([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate("/settings/add-account")}
          className="flex items-center gap-2 px-4 py-2 bg-third text-first rounded-lg hover:bg-third/90 transition"
        >
          <Plus className="w-4 h-4" />
          Thêm tài khoản mới
        </button>
      </div>

      <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm space-y-4">
        {/* Search + Sort */}
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
          <div className="relative w-full lg:w-1/2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo họ tên, username, email, SĐT"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-input bg-card text-card-foreground placeholder:text-second dark:placeholder:text-darkmodetext/40 focus:outline-none focus:ring-1 focus:ring-selectring"
            />
            <Search className="w-4 h-4 text-second absolute left-3 top-3" />
          </div>

          <div className="flex flex-wrap gap-2">
            <SortButton label="Sắp xếp theo tên" active={sortBy === "name"} onClick={() => setSortBy("name")} />
            <SortButton label="Theo vai trò" active={sortBy === "role"} onClick={() => setSortBy("role")} />
            <SortButton label="Theo trạng thái" active={sortBy === "status"} onClick={() => setSortBy("status")} />
          </div>
        </div>

        {/* Bulk bar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-second/10 dark:bg-second/20 border border-second/30 dark:border-second/30">
            <span className="text-sm font-medium text-first dark:text-darkmodetext">
              Đã chọn {selectedIds.length} tài khoản
            </span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleBulkUnlock}
                className="px-3 py-1.5 rounded-lg border border-second/30 hover:bg-second/20 dark:hover:bg-second/30 flex items-center gap-1"
              >
                <Unlock className="w-4 h-4" /> Mở khóa
              </button>
              <button
                onClick={handleBulkLock}
                className="px-3 py-1.5 rounded-lg border border-second/30 hover:bg-second/20 dark:hover:bg-second/30 flex items-center gap-1"
              >
                <Lock className="w-4 h-4" /> Khóa
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-900/20 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Xóa
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 rounded-lg border border-second/30 hover:bg-second/20 dark:hover:bg-second/30"
              >
                Bỏ chọn
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {isFetching && (
          <div className="flex items-center gap-2 text-sm text-second">
            <Loader className="w-4 h-4 animate-spin" />
            Đang tải dữ liệu...
          </div>
        )}
        <div className="overflow-x-auto border border-second/30 dark:border-second/30 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-second/10 dark:bg-second/20">
              <tr className="text-left">
                <th className="py-3 px-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredAccounts.length && filteredAccounts.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded"
                  />
                </th>
                <th className="py-3 px-3 text-first dark:text-darkmodetext">Họ và tên</th>
                <th className="py-3 px-3 text-first dark:text-darkmodetext">Username</th>
                <th className="py-3 px-3 text-first dark:text-darkmodetext">Vai trò</th>
                <th className="py-3 px-3 text-first dark:text-darkmodetext">Trạng thái</th>
                <th className="py-3 px-3 text-first dark:text-darkmodetext">Ngày tạo</th>
                <th className="py-3 px-3 text-first dark:text-darkmodetext text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((acc) => (
                <tr
                  key={acc.id}
                  className="border-t border-second/20 dark:border-second/30 hover:bg-second/10 dark:hover:bg-second/20 transition"
                >
                  <td className="py-3 px-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(acc.id)}
                      onChange={() => toggleSelect(acc.id)}
                      className="w-4 h-4 rounded"
                    />
                  </td>
                  <td className="py-3 px-3 text-first dark:text-darkmodetext font-medium">{acc.fullName}</td>
                  <td className="py-3 px-3 text-first dark:text-darkmodetext">{acc.username}</td>
                  <td className="py-3 px-3 text-first dark:text-darkmodetext">{ROLE_LABEL[acc.role]}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        acc.status === "Hoạt động"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-200 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300"
                      }`}
                    >
                      {acc.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-first dark:text-darkmodetext">{acc.createdAt}</td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openModal(acc)}
                        className="p-2 rounded-lg border border-second/30 hover:bg-second/20 dark:hover:bg-second/30"
                      >
                        <Pencil className="w-4 h-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(acc.id)}
                        className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-second dark:text-darkmodetext/70">
                    Không có tài khoản nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Account Modal */}
      {showModal && formData && (
        <div
          className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={closeModal}
        >
          <div
            className="modal-content bg-card text-card-foreground rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-first dark:text-darkmodetext">
                {editingAccount ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-second/10 dark:hover:bg-second/30 rounded-lg">
                <X className="w-5 h-5 text-first dark:text-darkmodetext" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Họ và tên"
                value={formData.fullName}
                onChange={(v) => setFormData({ ...formData, fullName: v })}
                required
              />
              <Field
                label="Username"
                value={formData.username}
                onChange={(v) => setFormData({ ...formData, username: v })}
                required
              />
              <Field
                label="Email"
                value={formData.email || ""}
                onChange={(v) => setFormData({ ...formData, email: v })}
              />
              <Field
                label="Số điện thoại"
                value={formData.phone || ""}
                onChange={(v) => setFormData({ ...formData, phone: v })}
              />
              <Field
                label="CCCD"
                value={formData.cccd || ""}
                onChange={(v) => setFormData({ ...formData, cccd: v })}
              />
              <div>
                <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-1">
                  Vai trò
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-card text-card-foreground focus:outline-none focus:ring-1 focus:ring-selectring"
                >
                  <option value="admin">Quản trị viên</option>
                  <option value="staff">Nhân viên</option>
                  <option value="viewer">Xem</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-1">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-card text-card-foreground focus:outline-none focus:ring-1 focus:ring-selectring"
                >
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Khóa">Khóa</option>
                </select>
              </div>

              <Field
                label="Mật khẩu mặc định"
                value={formData.password || ""}
                onChange={(v) => setFormData({ ...formData, password: v })}
                placeholder={editingAccount ? "Để trống nếu không đổi" : "123456"}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                disabled={isSaving}
                className="flex-1 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 text-first dark:text-darkmodetext hover:bg-second/10 dark:hover:bg-second/30 disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !formData.fullName.trim() || !formData.username.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-third text-first hover:bg-third/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Lưu
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SortButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${
        active
          ? "bg-third text-first border-third"
          : "border-second/40 dark:border-second/30 text-first dark:text-darkmodetext hover:bg-second/10 dark:hover:bg-second/30"
      }`}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-input bg-card text-card-foreground focus:outline-none focus:ring-1 focus:ring-selectring"
      />
    </div>
  );
}





