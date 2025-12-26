import { useCallback, useEffect, useState } from "react";
import type { Account } from "@/types/account";
import { accountApi } from "@/api/account.api";

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    try {
      const res = await accountApi.getAll();
      setAccounts(res.data);
    } catch (e) {
      console.error(e);
      setError("Không thể tải danh sách tài khoản");
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const createAccount = async (payload: Partial<Account>) => {
    const res = await accountApi.create(payload);
    setAccounts((prev) => [res.data, ...prev]);
    return res.data;
  };

  const updateAccount = async (id: string, payload: Partial<Account>) => {
    const res = await accountApi.update(id, payload);
    setAccounts((prev) => prev.map((a) => (a.id === id ? res.data : a)));
    return res.data;
  };

  const deleteAccount = async (id: string) => {
    await accountApi.remove(id);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  return {
    accounts,
    setAccounts, // dùng cho bulk local (lock/unlock) nếu bạn chưa có API
    isFetching,
    error,
    refetch: fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
  };
}
