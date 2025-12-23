import statisticService from "../services/statisticService.js";

const getDashboard = async (req, res) => {
  try {
    const data = await statisticService.getDashboardStats();

    return res.status(200).json({
      success: true,
      message: "Lấy số liệu thống kê Dashboard thành công",
      data: data,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi Server khi lấy thống kê: " + error.message,
    });
  }
};

export default {
  getDashboard,
};
