import jwt from "jsonwebtoken";
import "dotenv/config";

export const generateTokenAndUser = (userInstance) => {
    // 1. Kiểm tra input
    if (!userInstance) {
        throw new Error("Không có thông tin User để tạo Token");
    }

    // 2. Chuyển Sequelize Instance sang JSON object thuần
    const rawUser = userInstance.toJSON ? userInstance.toJSON() : userInstance;

    // 3. Tách password ra khỏi object user, lấy phần còn lại (userInfo)
    const { password: _, ...userInfo } = rawUser;

    // 4. Tạo Token
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign(
        {
            user_id: userInfo.user_id,
            username: userInfo.username,
            role: userInfo.role,
        },
        secret,
        { expiresIn: "1d" }
    );

    // 5. Trả về cả Token và User Info (đã sạch password)
    return {
        token,
        user: userInfo,
    };
};