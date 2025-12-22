import jwt from "jsonwebtoken";
import "dotenv/config";

const verifyToken = (req, res, next) => {
    //Lấy token từ header
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) {
        return res.status(401).json({
            success: false,
            message: "Không tìm thấy token xác thực (Access Denied)",
        });
    }

    try {
        //Giải mã token
        //Dùng JWT_SECRET trong .env
        const secret = process.env.JWT_SECRET;
        const verified = jwt.verify(token, secret);

        req.user = verified;

        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: "Token không hợp lệ hoặc đã hết hạn",
        });
    }
};

export default verifyToken;