import searchService from "../services/searchService.js";

const handleSearch = async (req, res) => {
    try {
        // Lấy tất cả tham số sau dấu ? (Ví dụ: ?q=Hùng&age_min=18...)
        // Express gom nó vào biến req.query
        const queryParams = req.query;

        // Gọi service xử lý
        const result = await searchService.searchPeople(queryParams);

        return res.status(200).json({
            success: true,
            message: "Tìm kiếm thành công",
            data: result
        });
    } catch (error) {
        console.error("Lỗi tìm kiếm: ", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server: " + error.message
        });
    }
};

export default {
    handleSearch
}