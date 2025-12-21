"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, LogOut, Eye, EyeOff, Loader } from "lucide-react";

interface UserProfile {
  username: string;
  fullName: string;
  role: string;
  email: string;
  cccd: string;
  phone: string;
  avatar?: string;
}

const MOCK_USER: UserProfile = {
  username: "admin",
  fullName: "Nguyễn Văn Admin",
  role: "Quản trị viên",
  email: "admin@example.com",
  cccd: "012345678901",
  phone: "0901234567",
  avatar: undefined,
};

export default function Profile() {
  const navigate = useNavigate();
  const [user] = useState<UserProfile>(MOCK_USER);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const handleChangePassword = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setShowPasswordModal(true);
  };

  const handleSavePassword = async () => {
    setPasswordError("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Vui lòng điền đầy đủ các trường");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu mới không khớp");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Call API to change password
      setShowPasswordModal(false);
    } catch (err) {
      setPasswordError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-first dark:text-darkmodetext">Thông tin tài khoản</h2>

      {/* Account Info Card */}
      <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-6 mb-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-third/20 flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.fullName} className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-third" />
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField label="Họ và tên" value={user.fullName} />
            <InfoField label="Vai trò" value={user.role} />
            <InfoField label="Tên đăng nhập" value={user.username} />
            <InfoField label="Mật khẩu" value="••••••••" />
            <InfoField label="Email khôi phục" value={user.email} />
            <InfoField label="CCCD" value={user.cccd} />
            <InfoField label="Số điện thoại" value={user.phone} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-second/20 dark:border-second/30">
          <button
            onClick={handleChangePassword}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 text-first dark:text-darkmodetext hover:bg-second/10 dark:hover:bg-second/30 transition"
          >
            <Lock className="w-4 h-4" />
            Đổi mật khẩu
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="bg-card text-card-foreground rounded-xl shadow-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-first dark:text-darkmodetext">Đổi mật khẩu</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-second/10 dark:hover:bg-second/30 rounded-lg"
              >
                <Lock className="w-5 h-5 text-first dark:text-darkmodetext" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Old Password */}
              <div>
                <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                  Mật khẩu cũ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Nhập mật khẩu cũ"
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-input bg-card text-card-foreground focus:outline-none focus:ring-1 focus:ring-selectring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-second/10 dark:hover:bg-second/30 rounded"
                  >
                    {showOldPassword ? (
                      <EyeOff className="w-4 h-4 text-second" />
                    ) : (
                      <Eye className="w-4 h-4 text-second" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-input bg-card text-card-foreground focus:outline-none focus:ring-1 focus:ring-selectring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-second/10 dark:hover:bg-second/30 rounded"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4 text-second" />
                    ) : (
                      <Eye className="w-4 h-4 text-second" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                  Nhập lại mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-input bg-card text-card-foreground focus:outline-none focus:ring-1 focus:ring-selectring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-second/10 dark:hover:bg-second/30 rounded"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-second" />
                    ) : (
                      <Eye className="w-4 h-4 text-second" />
                    )}
                  </button>
                </div>
              </div>

              {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 text-first dark:text-darkmodetext hover:bg-second/10 dark:hover:bg-second/30 disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSavePassword}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-lg bg-third text-first hover:bg-third/90 disabled:opacity-50 flex items-center justify-center gap-2"
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
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="bg-card text-card-foreground rounded-xl shadow-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto flex items-center justify-center">
                <LogOut className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-first dark:text-darkmodetext">Xác nhận đăng xuất</h3>
              <p className="text-sm text-second dark:text-darkmodetext/70">Bạn có chắc chắn muốn đăng xuất?</p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 text-first dark:text-darkmodetext hover:bg-second/10 dark:hover:bg-second/30"
                >
                  Không
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  Có
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-second dark:text-darkmodetext/70 mb-1">{label}</label>
      <p className="text-sm text-first dark:text-darkmodetext font-medium">{value}</p>
    </div>
  );
}





