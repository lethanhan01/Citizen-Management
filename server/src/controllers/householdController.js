import householdService from "../services/householdService.js";

let createHousehold = async (req, res) => {
  try {
    const data = req.body;
    const newHousehold = await householdService.createHousehold(data);
    return res.status(201).json({
      message: "Tạo hộ khẩu thành công",
      household: newHousehold,
    });
  } catch (error) {
    console.error("Lỗi khi tạo hộ khẩu:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi tạo hộ khẩu",
      error: error.message,
    });
  }
};
let getAllHouseholds = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const safePage = Math.max(parseInt(page) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const result = await householdService.getAllHouseholds({
      page: safePage,
      limit: safeLimit,
    });
    return res.status(200).json({
      message: "Lấy danh sách hộ khẩu thành công",
      data: result.data,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalItems: result.totalItems,
        itemsPerPage: result.itemsPerPage,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách hộ khẩu:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi lấy danh sách hộ khẩu",
      error: error.message,
    });
  }
};
let getHouseholdById = async (req, res) => {
  try {
    const id = req.params.id;
    const household = await householdService.getHouseholdById(id);
    if (!household) {
      return res.status(404).json({
        message: "Hộ khẩu không tồn tại",
      });
    }
    return res.status(200).json({
      message: "Lấy thông tin hộ khẩu thành công",
      data: household,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin hộ khẩu:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi lấy thông tin hộ khẩu",
      error: error.message,
    });
  }
};
let updateHousehold = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const [updatedRows] = await householdService.updateHousehold(id, data);
    if (updatedRows === 0) {
      return res.status(404).json({
        message: "Hộ khẩu không tồn tại hoặc không có thay đổi",
      });
    }
    return res.status(200).json({
      message: "Cập nhật hộ khẩu thành công",
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật hộ khẩu:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi cập nhật hộ khẩu",
      error: error.message,
    });
  }
};
let deleteHousehold = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedRows = await householdService.deleteHousehold(id);
    if (deletedRows === 0) {
      return res.status(404).json({
        message: "Hộ khẩu không tồn tại",
      });
    }
    return res.status(200).json({
      message: "Xóa hộ khẩu thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa hộ khẩu:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi xóa hộ khẩu",
      error: error.message,
    });
  }
};
let addPersonToHousehold = async (req, res) => {
  try {
    const { hoKhauId } = req.params;
    const personData = req.body;
    const event_type = personData.event_type;

    // Validate dữ liệu đầu vào
    const requiredFields = ["full_name", "dob", "gender"];
    const missingFields = requiredFields.filter((field) => !personData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Thiếu thông tin bắt buộc: ${missingFields.join(", ")}`,
      });
    }

    // Validate relation_to_head
    if (!personData.relation_to_head) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin quan hệ với chủ hộ (relation_to_head)",
      });
    }

    // Validate event_type (loại biến động)
    const validEventTypes = ["birth", "move_in"];
    if (
      personData.event_type &&
      !validEventTypes.includes(personData.event_type)
    ) {
      return res.status(400).json({
        success: false,
        message: `event_type phải là 'birth' hoặc 'move_in'`,
      });
    }

    // Gọi service để thêm nhân khẩu
    const result = await householdService.addPersonToHousehold(
      hoKhauId,
      event_type,
      personData,
      req.user?.user_id // userId từ authentication middleware (nếu có)
    );

    res.status(201).json({
      success: true,
      message: "Thêm nhân khẩu vào hộ khẩu thành công",
      data: result,
    });
  } catch (error) {
    console.error("Error in addPersonToHousehold:", error);

    // Xử lý các lỗi cụ thể
    if (error.message.includes("Không tìm thấy hộ khẩu")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("Số CCCD đã tồn tại")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm nhân khẩu vào hộ khẩu",
      error: error.message,
    });
  }
};
let splitHousehold = async (req, res) => {
  try {
    const {
      hoKhauCuId,
      thongTinHoKhauMoi,
      chuHoMoiId,
      danhSachNhanKhauTachDi,
    } = req.body;

    // Validate input
    if (!hoKhauCuId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin hoKhauCuId",
      });
    }

    if (
      !thongTinHoKhauMoi ||
      !thongTinHoKhauMoi.household_no ||
      !thongTinHoKhauMoi.address
    ) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin hộ khẩu mới (household_no, address)",
      });
    }

    if (!chuHoMoiId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin chuHoMoiId",
      });
    }

    if (
      !danhSachNhanKhauTachDi ||
      !Array.isArray(danhSachNhanKhauTachDi) ||
      danhSachNhanKhauTachDi.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Thiếu hoặc sai định dạng danhSachNhanKhauTachDi",
      });
    }

    // Kiểm tra chuHoMoiId có trong danhSachNhanKhauTachDi không

    const listIds = danhSachNhanKhauTachDi.map((id) => String(id));
    if (!listIds.includes(String(chuHoMoiId))) {
      return res.status(400).json({
        success: false,
        message: "Chủ hộ mới phải nằm trong danh sách nhân khẩu tách đi",
      });
    }

    const result = await householdService.splitHousehold(
      hoKhauCuId,
      thongTinHoKhauMoi,
      chuHoMoiId,
      danhSachNhanKhauTachDi
    );

    res.status(201).json({
      success: true,
      message: "Tách hộ khẩu thành công",
      data: result,
    });
  } catch (error) {
    console.error("Error in splitHousehold:", error);

    if (error.message.includes("Không tìm thấy")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("không thuộc hộ")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi khi tách hộ khẩu",
      error: error.message,
    });
  }
};
let getHouseholdHistory = async (req, res) => {
  try {
    const householdId = req.params.id;
    const history = await householdService.getHouseholdHistory(householdId);
    return res.status(200).json({
      message: "Lấy lịch sử hộ khẩu thành công",
      data: history,
    });
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử hộ khẩu:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi lấy lịch sử hộ khẩu",
      error: error.message,
    });
  }
};

let changeHouseholdHead = async (req, res) => {
  try {
    const { hoKhauId } = req.params;
    const { chuHoMoiId, relationOldHead } = req.body;

    if (!chuHoMoiId || !relationOldHead) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin chuHoMoiId hoặc relationOlHead",
      });
    }
    const result = await householdService.changeHouseholdHead(
      hoKhauId,
      chuHoMoiId,
      relationOldHead
    );
    return res.status(200).json({
      success: true,
      message: "Chuyển chủ hộ thành công",
      data: result,
    });
  } catch (error) {
    console.log("Error in changeHouseholdHead:", error);
    if (error.message.includes("Không tìm thấy")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("không phải là thành viên")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi khi thay đổi chủ hộ",
      error: error.message,
    });
  }
};
export {
  createHousehold,
  getAllHouseholds,
  getHouseholdById,
  updateHousehold,
  deleteHousehold,
  addPersonToHousehold,
  splitHousehold,
  getHouseholdHistory,
  changeHouseholdHead,
};
