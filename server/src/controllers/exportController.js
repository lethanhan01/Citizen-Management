import exportService from "../services/exportService.js";

// 1. Xuất file thu phí (Danh sách những hộ đang nợ hoặc chưa đóng)
const exportFeeReport = async (req, res) => {
    try {
        const { id } = req.params;
        const buffer = await exportService.exportFeeReportToExcel(id);

        // Đặt tên file khi tải xuống (VD: BaoCaoThuPhi_5.xlsx)
        const fileName = `BaoCaoThuPhi_TonDong_${id}.xlsx`;

        // Cấu hình Header bắt buộc để tải file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        // Gửi dữ liệu nhị phân
        return res.send(buffer);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Lỗi xuất file: " + error.message
        });
    }
};

// Xuất file đóng góp
const exportDonationReport = async (req, res) => {
    try {
        const { id } = req.params;
        const buffer = await exportService.exportDonationReportToExcel(id);

        const fileName = `DanhSachUngHo_${id}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        return res.send(buffer);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lỗi xuất file: " + error.message
        });
    }
};

// 3. Xuất danh sách tổng hợp 
const exportFullFeeReport = async (req, res) => {
    try {
        const { id } = req.params;
        const buffer = await exportService.exportFullFeeReport(id); // Gọi hàm mới

        const fileName = `TongHopThuPhi_${id}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        return res.send(buffer);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// 4. Xuất phiếu thu (Để in ấn)
const exportReceipts = async (req, res) => {
    try {
        const { id } = req.params;
        const buffer = await exportService.exportReceiptsForPrinting(id);

        const fileName = `PhieuThu_InAn_${id}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        return res.send(buffer);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export default {
    exportFeeReport,
    exportDonationReport,
    exportFullFeeReport,
    exportReceipts
};