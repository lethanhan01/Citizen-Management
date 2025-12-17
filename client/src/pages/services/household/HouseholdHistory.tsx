"use client";

export default function HouseholdHistory() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-first dark:text-fourth">
        Lịch sử thay đổi hộ khẩu
      </h2>

      <div className="bg-white dark:bg-transparent dark:border dark:border-second/40 dark:backdrop-blur-md rounded-xl p-6 shadow-sm dark:shadow-none">
        <p className="text-second dark:text-fourth/70 mb-6">
          Xem toàn bộ lịch sử thay đổi của hộ khẩu
        </p>
        {/* Timeline sẽ được thêm sau */}
      </div>
    </div>
  );
}
