import db from "../models/index.js";
import { Op, where } from "sequelize";

const Person = db.Person;
const Household = db.Household;

const searchPeople = async (queryParams) => {
  // 1. Lấy các tham số từ URL
  const {
    // Tìm kiếm chung
    q,

    // Bộ lọc đích danh (Cá nhân)
    gender, // 'male', 'female', 'other'
    ethnicity, // 'Kinh', 'Tay'...
    status, // 'permanent', 'temporary_resident'...
    occupation, // Tìm theo nghề nghiệp

    // Bộ lọc Hộ khẩu & Địa chỉ
    household_no, // Tìm theo số sổ hộ khẩu (HK929345)
    address, // Tìm theo địa chỉ (59820 Hannah...)

    // Bộ lọc khoảng (Range)
    age_min,
    age_max, // Tìm theo tuổi (VD: 18 - 60)

    // Phân trang
    page = 1,
    limit = 10,
  } = queryParams;

  const offset = (page - 1) * limit;

  // 2. Xây dựng điều kiện tìm kiếm
  // A. Điều kiện cho bảng Person
  let personWhere = {};

  // 1. Xử lý từ khóa chung (q): Quét trên Tên, Bí danh, CCCD
  if (q) {
    personWhere[Op.or] = [
      { full_name: { [Op.iLike]: `%${q}%` } },
      { alias: { [Op.iLike]: `%${q}%` } },
      { citizen_id_num: { [Op.iLike]: `%${q}%` } },
    ];
  }

  // 2. Các bộ lọc chính xác
  if (gender) personWhere.gender = gender;
  if (status) personWhere.residency_status = status;

  // 3. Các bộ lọc tương đối
  if (ethnicity) personWhere.ethnicity = { [Op.iLike]: `%${ethnicity}` };
  if (occupation) personWhere.occupation = { [Op.iLike]: `%${occupation}` };

  // 4. Xử lý tìm kiếm theo độ tuổi
  // DB đang lưu dob -> User cần tìm age. Convert Age -> Date
  if (age_min || age_max) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDay();
    const dobCondition = {};

    // Ví dụ: Năm nay 2025. Tìm người >= 20 tuổi
    // => Sinh trước hoặc trong năm (2025 - 20) = 2005
    if (age_min) {
      const maxYear = year - parseInt(age_min);
      dobCondition[Op.lte] = new Date(`${maxYear}-${month}-${day}`);
    }

    // Ví dụ: Tìm người <= 30 tuổi
    // => Sinh sau hoặc trong năm (2025 - 30) = 1995
    if (age_max) {
      const minYear = year - parseInt(age_max);
      dobCondition[Op.gte] = new Date(`${minYear}-${month}-${day}`);
    }

    personWhere.dob = dobCondition;
  }

  // B. Điều kiện cho bảng Household (Liên kết)
  let householdWhere = {};
  let includeRequired = false; // Mặc định là false (Left Join)

  if (household_no) {
    householdWhere.household_no = { [Op.iLike]: `%${household_no}` };
    includeRequired = true; // Nếu tìm theo hộ khẩu, bắt buộc phải có hộ khẩu (Inner Join)
  }

  if (address) {
    householdWhere.address = { [Op.iLike]: `%${address}` };
    includeRequired = true;
  }

  // --- Thực thi truy vấn ---
  const { count, rows } = await Person.findAndCountAll({
    where: personWhere,
    include: [
      {
        model: Household,
        as: "households",
        where: Object.keys(householdWhere).length > 0 ? householdWhere : null,
        required: includeRequired, // Quan trọng: True = Chỉ lấy người khớp điều kiện hộ, False = Lấy cả người không có hộ
        through: { attributes: ["relation_to_head", "is_head"] }, // Lấy thêm quan hệ chủ hộ
      },
    ],
    distinct: true, // Để đếm đúng số lượng người (tránh duplicate do join)
    order: [["created_at", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  // --- TÍNH TOÁN DỮ LIỆU BỔ SUNG (Derived Fields) ---
  // Vì DB không lưu 'age', ta tính toán nó trước khi trả về FE
  const finalData = rows.map((person) => {
    const p = person.toJSON();

    //Tính tuổi chính xác
    if (p.dob) {
      const birthDate = new Date(p.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      p.age = age;
    } else {
        p.age = null;
    }
    return p;
  });

  return {
    totalRecords: count,
    totalPages: Math.ceil(count/limit),
    currentPage: parseInt(page),
    data: finalData
  };
};

export default { searchPeople };
