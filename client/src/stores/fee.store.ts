import { create } from 'zustand';
import * as FeeAPI from '@/api/fee.api';
import type { ApiParams, UnknownRecord } from '@/types/api';

export interface Fee {
  rate_id: number;
  item_type: string;
  unit_type: 'per_person' | 'per_household';
  amount: number;
  effective_from: string;
  effective_to?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface HouseholdShort {
  household_no: string;
  address: string;
  head_person_id: number;
  headPerson?: {
    full_name: string;
    citizen_id_num: string;
  };
}

export interface Payment {
  payment_id: number;
  household_id: number;
  rate_id: number;
  year: number;
  payment_status: 'pending' | 'partial' | 'paid';
  total_amount: string | number;
  paid_amount: string | number;
  payment_method?: string;
  date?: string;
  note?: string;

  household?: HouseholdShort;
  feeRate?: {
    item_type: string;
    amount: string | number;
  };
}

interface FeeStats {
    paid: number;
    partial: number;
    pending: number;
}

export interface PaymentSearchParams extends ApiParams {
  rate_id?: number | string;
  status?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}

interface PaginationMeta {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
}

interface FeeState {
  fees: Fee[];
  payments: Payment[];

  pagination: PaginationMeta;
  totalRevenue: number;

  stats: FeeStats;

  loading: boolean;
  error: string | null;

  fetchAllFees: () => Promise<void>;
  createFeeWave: (payload: {
    item_type: string;
    unit_type: 'per_person' | 'per_household';
    amount: number;
    effective_from: string;
    effective_to?: string | null;
    note?: string;
  }) => Promise<boolean>;

  deleteFeeWave: (id: string | number) => Promise<boolean>;

  fetchPayments: (params?: PaymentSearchParams) => Promise<void>;

  confirmPayment: (payload: {
    payment_id: number;
    amount: number;
    payment_method: string;
    note?: string;
  }) => Promise<boolean>;

  clearError: () => void;
}

export const useFeeStore = create<FeeState>((set, get) => ({
  fees: [],
  payments: [],
  pagination: {
    totalRecords: 0,
    totalPages: 0,
    currentPage: 1,
  },
  totalRevenue: 0,
  stats: { paid: 0, partial: 0, pending: 0 },
  loading: false,
  error: null,

  // 1. Lấy danh sách các khoản thu
  fetchAllFees: async () => {
    set({ loading: true, error: null });
    try {
      const data = await FeeAPI.getAllFees();

      const normalizedFees: Fee[] = (Array.isArray(data) ? data : []).map((f: UnknownRecord) => ({
        rate_id: Number((f as { rate_id?: unknown }).rate_id),
        item_type: String((f as { item_type?: unknown }).item_type ?? ''),
        unit_type:
          (f as { unit_type?: Fee['unit_type'] }).unit_type ?? 'per_person',
        amount: Number((f as { amount?: unknown }).amount),
        effective_from: String((f as { effective_from?: unknown }).effective_from ?? ''),
        effective_to: (f as { effective_to?: string | null }).effective_to ?? undefined,
        note: (f as { note?: string }).note ?? undefined,
        createdAt: (f as { createdAt?: string }).createdAt ?? undefined,
        updatedAt: (f as { updatedAt?: string }).updatedAt ?? undefined,
      }));

      set({ fees: normalizedFees, loading: false });

    } catch (err: unknown) {
      set({
        error:
          getErrorMessage(err, 'Lỗi lấy danh sách khoản thu'),
        loading: false,
      });
    }
  },

  // 2. Tạo đợt thu mới
  createFeeWave: async (payload) => {
    set({ loading: true, error: null });
    try {
      await FeeAPI.createFee(payload);
      await get().fetchAllFees();
      set({ loading: false });
      return true;
    } catch (err: unknown) {
      set({
        error:
          getErrorMessage(err, 'Lỗi tạo khoản thu mới'),
        loading: false,
      });
      return false;
    }
  },

  // 3. Xóa đợt thu
  deleteFeeWave: async (id) => {
    set({ loading: true, error: null });
    try {
      await FeeAPI.deleteFee(id.toString());
      const currentFees = get().fees;
      set({
        fees: currentFees.filter((f) => f.rate_id !== Number(id)),
        loading: false,
      });
      return true;
    } catch (err: unknown) {
      set({
        error: getErrorMessage(err, 'Lỗi xóa khoản thu'),
        loading: false,
      });
      return false;
    }
  },

  // 4. Tìm kiếm / Lấy danh sách phiếu thu (Payments)
  fetchPayments: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await FeeAPI.searchPayments(params);

      if (response) {
        set({
          payments: response.data || [],
          totalRevenue: response.totalRevenue || 0,
          stats: response.stats || { paid: 0, partial: 0, pending: 0 },
          pagination: {
            totalRecords: response.totalRecords || 0,
            totalPages: response.totalPages || 0,
            currentPage: response.currentPage || 1,
          },
          loading: false,
        });
      } else {
        set({ payments: [], loading: false });
      }
    } catch (err: unknown) {
      set({
        error:
          getErrorMessage(err, 'Lỗi tìm kiếm danh sách đóng tiền'),
        loading: false,
      });
    }
  },

  // 5. Xác nhận nộp tiền
  confirmPayment: async (payload) => {
    try {
      const updatedPayment = await FeeAPI.confirmPayment(payload);

      if (updatedPayment) {
        const currentPayments = get().payments;
        const index = currentPayments.findIndex(
          (p) => p.payment_id === updatedPayment.payment_id,
        );

        if (index !== -1) {
          const newPayments = [...currentPayments];
          newPayments[index] = {
            ...newPayments[index],
            ...updatedPayment,
          };

          const addedAmount = Number(payload.amount);
          const newRevenue = Number(get().totalRevenue) + addedAmount;

          set({ payments: newPayments, totalRevenue: newRevenue });
        }
        return true;
      }
      return false;
    } catch (err: unknown) {
      set({
        error: getErrorMessage(err, 'Lỗi xác nhận đóng tiền'),
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err && typeof err === 'object') {
    const responseMessage = (err as { response?: { data?: { message?: unknown } } }).response?.data
      ?.message;
    if (typeof responseMessage === 'string' && responseMessage.trim()) return responseMessage;
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  return fallback;
};
