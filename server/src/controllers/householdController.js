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
        const households = await householdService.getAllHouseholds();
        return res.status(200).json({
            message: "Lấy danh sách hộ khẩu thành công",
            households: households,
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
            household: household,
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
export {
    createHousehold,
    getAllHouseholds,
    getHouseholdById,
    updateHousehold,
    deleteHousehold,
};
