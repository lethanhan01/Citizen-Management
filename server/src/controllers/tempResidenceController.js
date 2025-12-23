import tempResidenceService from "../services/tempResidenceService.js";

let createTempResidence = async (req, res) => {
    try {
        const data = req.body;
        const newTempResidence = await tempResidenceService.createTempResidence(
            data
        );
        return res.status(201).json({
            message: "Tạo tạm trú/tạm vắng thành công",
            tempResidence: newTempResidence,
        });
    } catch (error) {
        console.error("Lỗi khi tạo tạm trú/tạm vắng:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ khi tạo tạm trú/tạm vắng",
            error: error.message,
        });
    }
};

let getTempResidence = async (req, res) => {
    try {
        const { householdId, type, to_date } = req.query;
        // Logic to get temporary residence/absence records based on householdId and type
        const tempResidences = await tempResidenceService.getTempResidence(
            householdId,
            type,
            to_date
        );
        return res.status(200).json({
            message: "Lấy thông tin tạm trú/tạm vắng thành công",
            data: tempResidences,
        });
    } catch (error) {
        console.error("Lỗi khi lấy thông tin tạm trú/tạm vắng:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ khi lấy thông tin tạm trú/tạm vắng",
            error: error.message,
        });
    }
};

let updateTempResidence = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedTempResidence =
            await tempResidenceService.updateTempResidence(id, updateData);
        return res.status(200).json({
            message: "Cập nhật tạm trú/tạm vắng thành công",
            tempResidence: updatedTempResidence,
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật tạm trú/tạm vắng:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ khi cập nhật tạm trú/tạm vắng",
            error: error.message,
        });
    }
};

let deleteTempResidence = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCount = await tempResidenceService.deleteTempResidence(id);
        if (deletedCount === 0) {
            return res.status(404).json({
                message: "Không tìm thấy tạm trú/tạm vắng để xóa",
            });
        }
        return res.status(200).json({
            message: "Xóa tạm trú/tạm vắng thành công",
            deletedCount: deletedCount,
        });
    } catch (error) {
        console.error("Lỗi khi xóa tạm trú/tạm vắng:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ khi xóa tạm trú/tạm vắng",
            error: error.message,
        });
    }
};

export {
    createTempResidence,
    getTempResidence,
    updateTempResidence,
    deleteTempResidence,
};
