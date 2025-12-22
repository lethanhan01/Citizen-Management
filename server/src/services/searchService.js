import db from "../models/index.js";
import { Op } from "sequelize";

const Person = db.Person;
const Household = db.Household;

const searPeople = async (queryParams) => {
  // 1. Lấy các tham số từ URL
  const {
    q, // Từ khóa tìm kiếm chung (Tên, CCCD...)
    gender, // Lọc giới tính
    status, // Lọc trạng thái (thường trú, tạm trú...)
    age_min, // Tuổi nhỏ nhất
    age_max, // Tuổi lớn nhất
    page = 1, // Trang hiện tại (mặc định 1)
    limit = 10, // Số lượng bản ghi mỗi trang (mặc định 10)
  } = queryParams;

  const offset = (page - 1) * limit;

  // 2. Xây dựng điều kiện tìm kiếm
  let whereConditions = {};

  // --- LOGIC 1: Tìm kiếm theo từ khóa
  if (q) {
    whereConditions[Op.or] = [
      // Tìm trong Họ tên (không phân biệt hoa thường - iLike chỉ dùng cho Postgres)
      { full_name: { [Op.iLike]: `%${q}%` } },
      // Tìm trong CCCD
      { cccd_number: { [Op.iLike]: `%${q}%` } },
      // Tìm trong Nghề nghiệp
      { profession: { [Op.iLike]: `%${q}%` } },
      // Tìm trong Quê quán
      { native_place: { [Op.iLike]: `%${q}%` } },
    ];
  }
};
