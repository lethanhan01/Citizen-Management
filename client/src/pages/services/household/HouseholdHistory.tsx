"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader, History, RefreshCw, ArrowRight, Plus, Minus } from "lucide-react";
import * as HouseholdAPI from "@/api/household.api";

type HistoryRow = {
  id?: string | number;
  household_id: string | number;
  event_type: string;
  field_changed?: string | null;
  old_value?: any;
  new_value?: any;
  changed_at: string | Date;
  changed_by_user_id?: string | number | null;
  note?: string | null;
};

export default function HouseholdHistory() {
  const [params] = useSearchParams();
  const initialId = params.get("id") || params.get("household_no") || params.get("code") || "";
  const [householdId, setHouseholdId] = useState(initialId);
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [residentMap, setResidentMap] = useState<Record<string, string>>({});

  const parsedRows = useMemo(() => {
    return rows.map((r) => {
      const parseMaybeJSON = (v: any) => {
        if (typeof v === "string") {
          try {
            return JSON.parse(v);
          } catch {
            return v;
          }
        }
        return v;
      };
      return {
        ...r,
        old_value: parseMaybeJSON(r.old_value),
        new_value: parseMaybeJSON(r.new_value),
      } as HistoryRow;
    });
  }, [rows]);

  const fetchHistory = async (raw: string) => {
    if (!raw) return;
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

      // Fetch household detail to build resident name map for friendly display
      const detail = await HouseholdAPI.getHouseholdById(idForQuery);
      const residents = Array.isArray(detail?.residents)
        ? detail.residents
        : Array.isArray(detail?.members)
        ? detail.members
        : [];
      const map: Record<string, string> = {};
      residents.forEach((m: any) => {
        const pid = String(m?.person_id ?? m?.id ?? "");
        const name = String(
          m?.full_name ?? m?.fullName ?? m?.name ?? m?.person_name ?? ""
        );
        if (pid) map[pid] = name || map[pid] || pid;
      });
      // Include current head if present
      const headId = String(
        detail?.head_person_id ?? detail?.chu_ho_id ?? detail?.headId ?? ""
      );
      const headName = String(
        detail?.head_name ?? detail?.chu_ho_ten ?? detail?.headName ?? ""
      );
      if (headId) map[headId] = headName || map[headId] || headId;
      setResidentMap(map);

      const data = await HouseholdAPI.getHouseholdHistory(idForQuery);
      // Support both findAndCountAll shape and plain array
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.rows)
        ? data.rows
        : [];
      setRows(list as HistoryRow[]);
    } catch (e: any) {
      setError(e?.message || "Không lấy được lịch sử hộ khẩu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) fetchHistory(initialId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  return (
    <div className="space-y-6">
      <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-third" />
            <h3 className="text-lg font-semibold text-first dark:text-darkmodetext">
              Lịch sử thay đổi hộ khẩu
            </h3>
          </div>
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
            onClick={() => fetchHistory(householdId)}
            disabled={loading || !householdId}
            className="px-4 py-2 rounded-lg bg-third text-first hover:bg-third/90 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" /> Đang tải...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" /> Tải lịch sử
              </>
            )}
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="space-y-3">
          {loading && !rows.length ? (
            <div className="flex items-center gap-2 text-second">
              <Loader className="w-4 h-4 animate-spin" /> Đang tải lịch sử...
            </div>
          ) : parsedRows.length === 0 ? (
            <p className="text-second dark:text-darkmodetext/70">
              {householdId ? "Không có lịch sử nào." : "Hãy nhập ID hộ khẩu để xem lịch sử."}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {parsedRows.map((item, idx) => (
                <li key={(item as any).id ?? idx} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      {renderSummary(item, residentMap)}
                    </div>
                    <span className="shrink-0 text-[11px] md:text-xs text-second dark:text-darkmodetext/70">
                      {new Date(item.changed_at).toLocaleString("vi-VN")} · {formatRelative(item.changed_at)}
                    </span>
                  </div>
                  {/* Note is now shown in the summary header when present */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {renderValueCard("Giá trị cũ", item.old_value, item.field_changed, residentMap)}
                    {renderValueCard("Giá trị mới", item.new_value, item.field_changed, residentMap)}
                  </div>
                  {renderArrayDiff(item.old_value, item.new_value, residentMap)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function formatRelative(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const sec = Math.round(diffMs / 1000);
  const abs = Math.abs(sec);
  const rtf = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });
  if (abs < 60) return rtf.format(-sec, "second");
  const min = Math.round(sec / 60);
  if (Math.abs(min) < 60) return rtf.format(-min, "minute");
  const hr = Math.round(min / 60);
  if (Math.abs(hr) < 24) return rtf.format(-hr, "hour");
  const day = Math.round(hr / 24);
  if (Math.abs(day) < 30) return rtf.format(-day, "day");
  const mo = Math.round(day / 30);
  if (Math.abs(mo) < 12) return rtf.format(-mo, "month");
  const yr = Math.round(mo / 12);
  return rtf.format(-yr, "year");
}

function getPersonName(value: any, residentMap: Record<string, string>) {
  if (value == null) return "";
  if (typeof value === "number" || (typeof value === "string" && /^\d+$/.test(value))) {
    const id = String(value);
    return residentMap[id] || id;
  }
  if (typeof value === "object") {
    const pid = String(value?.person_id ?? value?.id ?? "");
    const nm = String(value?.full_name ?? value?.name ?? "");
    return residentMap[pid] || nm || pid;
  }
  return String(value);
}

function renderSummary(item: any, residentMap: Record<string, string>) {
  const type = String(item?.event_type || "");
  // Prefer using item's note as the main title when available
  if (item?.note) {
    return (
      <p className="text-sm md:text-base font-medium text-first dark:text-darkmodetext truncate">
        {item.note}
      </p>
    );
  }
  if (type === "head_change") {
    const fromName = getPersonName(item?.old_value, residentMap);
    const toName = getPersonName(item?.new_value, residentMap);
    return (
      <p className="text-sm md:text-base font-medium text-first dark:text-darkmodetext truncate">
        Thay đổi chủ hộ từ {fromName} sang {toName}
      </p>
    );
  }
  if (type === "address_change") {
    const oldAddr = item?.old_value ?? "—";
    const newAddr = item?.new_value ?? "—";
    return (
      <p className="text-sm md:text-base font-medium text-first dark:text-darkmodetext truncate">
        Cập nhật địa chỉ: {String(oldAddr)} → {String(newAddr)}
      </p>
    );
  }

  // Members added/removed – show concise counts
  const oldArr = Array.isArray(item?.old_value) ? item.old_value : [];
  const newArr = Array.isArray(item?.new_value) ? item.new_value : [];
  if (type === "members_add" || type === "members_remove") {
    const norm = (arr: any[]) =>
      new Set(
        arr.map((v) => (typeof v === "object" ? String(v?.person_id ?? v?.id ?? v) : String(v)))
      );
    const oldSet = norm(oldArr);
    const newSet = norm(newArr);
    const added = [...newSet].filter((id) => !oldSet.has(id));
    const removed = [...oldSet].filter((id) => !newSet.has(id));
    const addedNames = added.map((id) => residentMap[id] || id).slice(0, 3);
    const removedNames = removed.map((id) => residentMap[id] || id).slice(0, 3);
    const moreAdd = Math.max(0, added.length - addedNames.length);
    const moreRem = Math.max(0, removed.length - removedNames.length);
    const parts: string[] = [];
    if (added.length)
      parts.push(
        `Thêm ${added.length} thành viên` + (addedNames.length ? ` (${addedNames.join(", ")}${moreAdd ? `, +${moreAdd}` : ""})` : "")
      );
    if (removed.length)
      parts.push(
        `Xóa ${removed.length} thành viên` + (removedNames.length ? ` (${removedNames.join(", ")}${moreRem ? `, +${moreRem}` : ""})` : "")
      );
    if (parts.length) {
      return (
        <p className="text-sm md:text-base font-medium text-first dark:text-darkmodetext truncate">
          {parts.join("; ")}
        </p>
      );
    }
  }

  // Fallback: show note if any, else nothing
  if (item?.note) {
    return (
      <p className="text-sm md:text-base font-medium text-first dark:text-darkmodetext truncate">
        {item.note}
      </p>
    );
  }
  return null;
}
function renderValueCard(
  title: string,
  value: any,
  field: string | null | undefined,
  residentMap: Record<string, string>
) {
  const formatted = formatValue(value, field || "", residentMap);
  return (
    <div className="p-3 rounded-lg bg-muted/10">
      <p className="text-xs font-semibold text-second dark:text-darkmodetext/70">{title}</p>
      {Array.isArray(formatted) ? (
        <ul className="mt-1 flex flex-wrap gap-2">
          {formatted.map((chip, i) => (
            <li key={i} className="px-2 py-1 text-xs rounded bg-second/10 text-first dark:text-darkmodetext">
              {chip}
            </li>
          ))}
        </ul>
      ) : typeof formatted === "object" ? (
        <pre className="text-xs text-first dark:text-darkmodetext whitespace-pre-wrap break-words mt-1">{JSON.stringify(formatted, null, 2)}</pre>
      ) : (
        <div className="mt-1 text-sm text-first dark:text-darkmodetext inline-flex items-center gap-2">
          <span>{String(formatted)}</span>
          {title.includes("cũ") && value != null && (
            <ArrowRight className="w-4 h-4 text-second" />
          )}
        </div>
      )}
    </div>
  );
}

function formatValue(value: any, field: string, residentMap: Record<string, string>) {
  if (value == null) return "—";

  // Primitive numbers or numeric strings
  if (typeof value === "number" || (typeof value === "string" && /^\d+$/.test(value))) {
    const id = String(value);
    if (/(_id$|person_id)/i.test(field)) {
      const name = residentMap[id];
      return name ? `${name} (ID ${id})` : id;
    }
    return String(value);
  }

  // Arrays
  if (Array.isArray(value)) {
    const chips: string[] = value.map((v) => {
      if (typeof v === "object") {
        const pid = String(v?.person_id ?? v?.id ?? "");
        const baseName = v?.full_name ?? v?.name ?? (pid || "");
        const nm = residentMap[pid] ?? String(baseName);
        return nm || pid || JSON.stringify(v);
      }
      const pid = String(v);
      return residentMap[pid] ?? pid;
    });
    return chips;
  }

  // Objects
  if (typeof value === "object") {
    // If it looks like a person reference, make it friendly
    const pid = String(value?.person_id ?? value?.id ?? "");
    const nm = residentMap[pid] ?? String(value?.full_name ?? value?.name ?? "");
    if (pid || nm) return nm ? `${nm} (ID ${pid})` : pid;
    return value; // fallback pretty JSON in card
  }

  return String(value);
}

function renderArrayDiff(oldVal: any, newVal: any, residentMap: Record<string, string>) {
  const oldArr = Array.isArray(oldVal) ? oldVal : null;
  const newArr = Array.isArray(newVal) ? newVal : null;
  if (!oldArr && !newArr) return null;

  const norm = (arr: any[]) =>
    new Set(
      arr.map((v) => {
        const id = typeof v === "object" ? String(v?.person_id ?? v?.id ?? v) : String(v);
        return id;
      })
    );

  const oldSet = oldArr ? norm(oldArr) : new Set<string>();
  const newSet = newArr ? norm(newArr) : new Set<string>();

  const added = [...newSet].filter((id) => !oldSet.has(id));
  const removed = [...oldSet].filter((id) => !newSet.has(id));

  if (!added.length && !removed.length) return null;

  return (
    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
      {removed.length > 0 && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
          <p className="text-xs font-semibold text-red-600 dark:text-red-400 inline-flex items-center gap-1">
            <Minus className="w-3 h-3" /> Đã xóa
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {removed.map((id) => (
              <li key={id} className="px-2 py-1 text-xs rounded bg-red-100 dark:bg-red-800/40 text-red-700 dark:text-red-200">
                {residentMap[id] ? `${residentMap[id]} (ID ${id})` : id}
              </li>
            ))}
          </ul>
        </div>
      )}
      {added.length > 0 && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
            <Plus className="w-3 h-3" /> Đã thêm
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {added.map((id) => (
              <li key={id} className="px-2 py-1 text-xs rounded bg-emerald-100 dark:bg-emerald-800/40 text-emerald-700 dark:text-emerald-200">
                {residentMap[id] ? `${residentMap[id]} (ID ${id})` : id}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}








