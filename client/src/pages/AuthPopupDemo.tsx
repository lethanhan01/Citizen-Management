"use client";

import AuthPopup from "@/components/AuthPopup";

export default function AuthPopupDemo() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-2">AuthPopup Demo</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Trang này luôn hiển thị thông báo không đủ quyền để bạn kiểm tra giao diện.
      </p>
      <AuthPopup redirectPath="/dashboard" />
    </div>
  );
}
