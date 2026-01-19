import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
import * as StatisticAPI from '@/api/statistic.api';

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err && typeof err === 'object') {
    const maybeMessage = (err as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage;
    }

    const responseMessage = (err as { response?: { data?: { message?: unknown } } }).response?.data
      ?.message;
    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage;
    }
  }
  return fallback;
};

interface DashboardData {
  tongSoHoKhau: number;
  tongSoNhanKhau: number;
  thongKeGioiTinh: {
    nam: number;
    nu: number;
    khac: number;
  };
  thongKeDoTuoi: {
    mamNon: number;
    hocSinh: number;
    laoDong: number;
    nghiHuu: number;
  };
  thongKeCuTru: {
    thuongTru: number;
    tamTru: number;
    tamVang: number;
  };

  thongKeTaiChinh: {
    tongThuThangNay: number; // Card 1
    tongDaThuNamNay: number; // Card 2
    tongCanThuNamNay: number; // Dùng tính % Card 2
    tongChuaThu: number; // Card 3

    doanhThuTheoThang: number[];

    trangThaiThu: {
      daHoanThanh: number;
      nopMotPhan: number; 
      chuaNop: number; 
    };

    topChienDich: Array<{
      tenChienDich: string;
      soTien: number;
    }>;

    giaoDichGanNhat: Array<{
      household_no: string;
      khoan_thu: string;
      so_tien: number;
      trang_thai: string;
      ngay_thu: string;
    }>;
  };
}

interface FeeReportData {
  tenKhoanThu: string;
  tongSoTienCanThu: number;
  tongSoTienDaThu: number;
  tienDoHoanThanh: number;
  soHoChuaNop: number;
  chiTietTrangThai: {
    daNopDu: number;
    nopThieu: number;
    chuaNop: number;
  };
  danhSachChuaNop: Array<{
    household_no: string;
    address: string;
    must_pay: number;
    paid: number;
    debt: number;
    status: string;
  }>;
}

interface DonationReportData {
  tenDotVanDong: string;
  tongTienThuDuoc: number;
  soHoThamGia: number;
  danhSachDongGop: Array<{
    household_no: string;
    address: string;
    amount: number;
    date: string;
    note: string | null;
  }>;
}

interface StatisticState {
  dashboardData: DashboardData | null;
  currentFeeReport: FeeReportData | null;
  currentDonationReport: DonationReportData | null;
  loading: boolean;
  error: string | null;

  fetchDashboard: () => Promise<void>;
  fetchFeeReport: (id: string) => Promise<void>;
  fetchDonationReport: (id: string) => Promise<void>;
  resetReports: () => void;
}

export const useStatisticStore = create<StatisticState>((set) => ({
  dashboardData: null,
  currentFeeReport: null,
  currentDonationReport: null,
  loading: false,
  error: null,

  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const data = await StatisticAPI.getDashboard();
      set({ dashboardData: data ?? null, loading: false });
    } catch (err: unknown) {
      set({
        error: getErrorMessage(err, 'Lỗi lấy số liệu Dashboard'),
        loading: false,
      });
    }
  },

  fetchFeeReport: async (id: string) => {
    set({ loading: true, error: null, currentFeeReport: null });
    try {
      const data = await StatisticAPI.getFeeReport(id);
      set({ currentFeeReport: data ?? null, loading: false });
    } catch (err: unknown) {
      set({
        error: getErrorMessage(err, 'Lỗi lấy báo cáo thu phí'),
        loading: false,
      });
    }
  },

  fetchDonationReport: async (id: string) => {
    set({ loading: true, error: null, currentDonationReport: null });
    try {
      const data = await StatisticAPI.getDonationReport(id);
      set({ currentDonationReport: data ?? null, loading: false });
    } catch (err: unknown) {
      set({
        error: getErrorMessage(err, 'Lỗi lấy báo cáo đóng góp'),
        loading: false,
      });
    }
  },

  resetReports: () => {
    set({ currentFeeReport: null, currentDonationReport: null, error: null });
  },
}));
