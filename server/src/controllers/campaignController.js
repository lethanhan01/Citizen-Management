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
        message: "Thiếu thông tin bắt buộc (campaign_id, household_id, amount)",
      });
    }

    const result = await campaignService.recordContribution(req.body);

    // Custom message tùy theo hành động
    const message =
      result.action === "created"
        ? "Đã ghi nhận đóng góp mới thành công!"
        : "Đã cập nhật (cộng dồn) số tiền đóng góp thành công!";

    return res.status(200).json({
        success: true,
        message: message,
        data: result.data
    });
  } catch (error) {
    return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message
    });
  }
};

export default {
  handleCreate,
  handleIndex,
  handleShow,
  handleUpdate,
  handleDelete,
  handleContribute
};
