import personService from "../services/personService.js";

export const getAllNhanKhau = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            gender,
            residency_status,
            minAge,
            maxAge,
            sortBy = "created_at",
            sortOrder = "DESC",
        } = req.query;

        const result = await personService.getAllNhanKhau({
            page: parseInt(page),
            limit: parseInt(limit),
            search,
            gender,
            residency_status,
            minAge: minAge ? parseInt(minAge) : undefined,
            maxAge: maxAge ? parseInt(maxAge) : undefined,
            sortBy,
            sortOrder: sortOrder.toUpperCase(),
        });

        res.status(200).json({
            success: true,
            data: result.data,
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: result.itemsPerPage,
            },
        });
    } catch (error) {
        console.error("Error in getAllNhanKhau:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách nhân khẩu",
            error: error.message,
        });
    }
};

export const getNhanKhauById = async (req, res) => {
    try {
        const { id } = req.params;

        const nhanKhau = await personService.getNhanKhauById(id);

        if (!nhanKhau) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy nhân khẩu",
            });
        }

        res.status(200).json({
            success: true,
            data: nhanKhau,
        });
    } catch (error) {
        console.error("Error in getNhanKhauById:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy thông tin nhân khẩu",
            error: error.message,
        });
    }
};

export const updateNhanKhau = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const allowedFields = [
            "full_name",
            "alias",
            "gender",
            "dob",
            "birthplace",
            "ethnicity",
            "hometown",
            "occupation",
            "workplace",
            "citizen_id_num",
            "citizen_id_issued_date",
            "citizen_id_issued_place",
            "residency_status",
            "residence_registered_date",
            "previous_address",
        ];

        const filteredData = {};
        Object.keys(updateData).forEach((key) => {
            if (allowedFields.includes(key)) {
                filteredData[key] = updateData[key];
            }
        });
        const membershipData = updateData.relation_to_head;

        if (Object.keys(filteredData).length === 0 && !membershipData) {
            return res.status(400).json({
                success: false,
                message: "Không có dữ liệu hợp lệ để cập nhật",
            });
        }

        const updatedNhanKhau = await personService.updateNhanKhau(
            id,
            filteredData,
            membershipData
        );

        if (!updatedNhanKhau) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy nhân khẩu",
            });
        }

        res.status(200).json({
            success: true,
            message: "Cập nhật thông tin nhân khẩu thành công",
            data: updatedNhanKhau,
        });
    } catch (error) {
        console.error("Error in updateNhanKhau:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật thông tin nhân khẩu",
            error: error.message,
        });
    }
};
export const getPersonEvents = async (req, res) => {
    try {
        const { id } = req.params;
        const events = await personService.getPersonEvents(id);
        return res.status(200).json({
            success: true,
            data: events,
        });
    } catch (error) {
        console.error("Error in getPersonEvents:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy sự kiện của nhân khẩu",
            error: error.message,
        });
    }
};
export const handlePersonEvent = async (req, res) => {
    try {
        const { nhanKhauId } = req.params;
        const { loaiBienDong, ngayBienDong, ghiChu, diaChi } = req.body;

        if (!loaiBienDong) {
            return res.status(400).json({
                success: false,
                message: "Loại biến động là bắt buộc",
            });
        }
        const validEventTypes = ["CHUYEN_DI", "QUA_DOI"];
        if (!validEventTypes.includes(loaiBienDong)) {
            return res.status(400).json({
                success: false,
                message: "Loại biến động không hợp lệ",
            });
        }
        const result = await personService.handlePersonEvent(
            nhanKhauId,
            loaiBienDong,
            ngayBienDong || new Date(),
            ghiChu,
            diaChi
        );
        return res.status(200).json({
            success: true,
            message: `Xử lý biến động ${
                loaiBienDong === "CHUYEN_DI" ? "chuyển đi" : "qua đời"
            } thành công`,
            data: result,
        });
    } catch (error) {
        console.error("Error in handlePersonEvent:", error);
        if (error.message.includes("Không tìm thấy")) {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        if (error.message.includes("không có hộ khẩu")) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        res.status(500).json({
            success: false,
            message: "Lỗi khi xử lý biến động nhân khẩu",
            error: error.message,
        });
    }
};
