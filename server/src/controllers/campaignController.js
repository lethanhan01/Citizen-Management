import campaignService from "../services/campaignService.js";

const handleCreate = async (req, res) => {
  try {
    const data = await campaignService.createCampaign(req.body);
    return res.status(201).json({
      success: true,
      message: "Tạo đợt vận động thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const handleIndex = async (req, res) => {
  try {
    const data = await campaignService.getAllCampaigns();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const handleShow = async (req, res) => {
  try {
    const data = await campaignService.getCampaignDetail(req.params.id);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const handleUpdate = async (req, res) => {
  try {
    const data = await campaignService.updateCampaign(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Cập nhật thành công",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const handleDelete = async (req, res) => {
  try {
    await campaignService.deleteCampaign(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Đã xóa đợt vận động",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const handleContribute = async (req, res) => {
  try {
    const { campaign_id, household_id, amount } = req.body;

    // Validate
    if (!campaign_id || !household_id || !amount) {
      return res.status(400).json({
        success: false,
        message:
          "Thiếu thông tin bắt buộc. Vui lòng nhập đủ: Chiến dịch, Hộ khẩu và Số tiền! (campaign_id, household_id, amount)",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số tiền đóng góp phải lớn hơn 0!",
      });
    }

    const result = await campaignService.recordContribution(req.body);

    // Tạo thông báo chi tiết
    let msg = "";
    if (result.action === "created") {
      msg = `Ghi nhận thành công! Hộ ${result.data.household_no} đã đóng ${result.data.amount} cho chiến dịch: ${result.data.campaign_name}.`;
    } else {
      msg = `Cập nhật thành công! Hộ ${result.data.household_no} đã đóng thêm ${result.data.contributeAmount}. Tổng cộng: ${result.data.amount}.`;
    }

    return res.status(200).json({
      success: true,
      message: msg,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống: " + error.message,
    });
  }
};

export default {
  handleCreate,
  handleIndex,
  handleShow,
  handleUpdate,
  handleDelete,
  handleContribute,
};
