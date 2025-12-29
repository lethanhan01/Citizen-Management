"use client";

import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AuthPopupProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  redirectPath?: string;
  onClose?: () => void;
}

export default function AuthPopup({
  title = "Không có quyền truy cập",
  message = "Bạn không có quyền vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cần thêm quyền.",
  actionLabel = "Quay lại",
  redirectPath,
  onClose,
}: AuthPopupProps) {
  const navigate = useNavigate();

  const handleClose = () => {
    if (onClose) onClose();
    if (redirectPath) {
      navigate(redirectPath, { replace: true });
    } else if (!onClose) {
      navigate(-1);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[clamp(280px,90vw,460px)] rounded-xl border border-border bg-card text-card-foreground shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-5">{message}</p>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="px-3 py-2 text-sm rounded-md border border-border hover:bg-muted/60"
              onClick={handleClose}
            >
              {actionLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
