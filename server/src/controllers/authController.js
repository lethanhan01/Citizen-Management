import authService from "../services/authService.js";

const handleRegister = async (req, res) => {
    try {
        const newUser = await authService.register(req.body);
        return res.status(201).json({
            success: true,
            message: "Đăng ký thành công",
            data: newUser
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const handleLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        if(!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đủ username và password"
            });
        }

        const data = await authService.login(username, password);
        return res.status(200).json({
            success: true,
            message: "Đăng nhập thành công",
            data: data
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

const handleUpdateProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;

        // Gọi service
        const updateUser = await authService.updateProfile(userId, req.body);

        return res.status(200).json({
            success: true,
            message: "Cập nhật thông tin thành công",
            data: updateUser
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const handleLogout = async (req, res) => {
    // Server không cần làm nhiều, tại token lưu ở client
    // Client phải bắt tín hiệu và xóa token ở LocalStorage.
    return res.status(200).json({
        success: true,
        message: "Đăng xuất thành công (Yêu cầu xóa token ở Client)"
    });
};

const getMe = async (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Lấy thông tin người dùng thành công",
        user: req.user
    });
};

export default {
    handleRegister,
    handleLogin,
    getMe,
    handleUpdateProfile,
    handleLogout
};