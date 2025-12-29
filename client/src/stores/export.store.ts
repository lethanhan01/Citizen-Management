import { create } from 'zustand';
import * as ExportAPI from '@/api/export.api'; 
import { toast } from 'react-hot-toast';

interface ExportStore {
  isExporting: boolean;
  exportReceipt: (paymentId: number | string) => Promise<void>;
}

export const useExportStore = create<ExportStore>((set) => ({
  isExporting: false,

  exportReceipt: async (paymentId) => {
    set({ isExporting: true });
    let url: string | null = null;

    try {
      const { blob, filename } = await ExportAPI.exportSingleReceipt(paymentId);

      url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      
      link.download = filename || `PhieuThu_${paymentId}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
  
      link.remove();
      toast.success('Đã tải hóa đơn thành công!');

    } catch (error: any) {
      console.error('Export error:', error);
      const msg = error?.response?.data?.message || error.message || 'Lỗi khi xuất hóa đơn';
      toast.error(msg);
    } finally {
      if (url) window.URL.revokeObjectURL(url);
      set({ isExporting: false });
    }
  },
}));