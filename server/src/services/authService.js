import db from "../models/index.js";
import "dotenv/config";
import { generateTokenAndUser } from "../utils/generateToken.js";

const User = db.User;

const register = async (data) => {
  //Check trùng username
  const existingUser = await User.findOne({
    where: { username: data.username },
  });

  if (existingUser) {
    throw new Error("Tên đăng nhập đã tồn tại");
  }

  const allowedRoles = ["admin", "accountant", "moderator"];
  if (data.role && !allowedRoles.includes(data.role)) {
    throw new Error("Quyền (Role) không hợp lệ");
  }

  //Tạo user (Password sẽ hash tự động trong hook ở Model)
  const newUser = await User.create({
    username: data.username,
    password: data.password,
    full_name: data.full_name,
    role: data.role || "accountant",
  });

  const { password: _, ...userInfo } = newUser.toJSON();
  return userInfo;
};

const login = async (username, password) => {
  // 1. Tìm user
  const user = await User.findOne({ where: { username } });
  if (!user) {
    throw new Error("Tên đăng nhập không tồn tại");
  }

  // 2. So sánh mật khẩu
  const isValid = await user.isValidPassword(password);
  if (!isValid) {
    throw new Error("Mật khẩu không chính xác");
  }

  // 3. Tạo token
  const data = generateTokenAndUser(user);

  return data;
};

const updateProfile = async (userId, updateData) => {
    // 1. Tìm user trong DB
    const user = await User.findByPk(userId);
    if(!user) {
        throw new Error("Người dùng không tồn tại");
    }

    // 2. Chặn bảo mật
    if(updateData.username) delete updateData.username;
    if(updateData.role) delete updateData.role;

    // 3. Cập nhật dữ liệu
    await user.update(updateData);

    // 4. Trả về thông tin mới
    const {password: _, ...userInfo } = user.toJSON();
    return userInfo;
};

export default {
  register,
  login,
  updateProfile
};
