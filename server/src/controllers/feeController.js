import feeService from "../services/feeService.js";

const handleCreateFee = async (req, res) => {
  try {
    // Data gửi từ FE
    // { item_type: "Phí vệ sinh 2025", unit_type: "per_person", amount: 6000, effective_from: "2025-01-01" }
    const newFee = await feeService.createFeeWave(req.body);

    return res.status(201).json({
      success: true,
      message:
        "Tạo đợt phí thu thành công! Đã khởi tạo phiếu thu cho toàn bộ dân cư.",
      data: newFee,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

const handleGetAllFees = async (req, res) => {
  try {
    const fees = await feeService.getAllFeeWaves();

    return res.status(200).json({
      success: true,
      data: fees,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const handleDeleteFee = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID từ URL

    await feeService.deleteFeeWave(id);

    return res.status(200).json({
      success: true,
      message: "Đã xóa đợt thu và toàn bộ phiếu thu liên quan thành công!",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const handleGetPayments = async (req, res) => {
  try {
    const result = await feeService.getPaymentList(req.query);
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đóng góp thành công",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  handleCreateFee,
  handleGetAllFees,
  handleDeleteFee,
  handleGetPayments
};
