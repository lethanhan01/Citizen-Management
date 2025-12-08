"use client";

export default function Dashboard() {
  return (
    <div className="bg-white dark:bg-transparent dark:border dark:border-second/40 dark:backdrop-blur-md rounded-xl p-6 shadow-sm dark:shadow-none">
      <h2 className="text-xl font-semibold mb-2 text-first dark:text-fourth">
        Chào mừng bạn đến Dashboard!
      </h2>
      <p className="text-second dark:text-fourth/70">
        Đây là nơi bạn có thể quản lý toàn bộ dữ liệu công dân.
      </p>
    </div>
  );
}
