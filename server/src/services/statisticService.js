import db from "../models/index.js";
import { Op } from "sequelize";

const Person = db.Person;
const Household = db.Household;

// Hàm phụ trợ: Tính mốc ngày sinh từ số tuổi
// Ví dụ: Muốn tìm người 6 tuổi, lấy ngày hiện tại trừ đi 6 năm
const getDateFromAge = (age) => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - age);
  return date;
};

const getDashboardStats = async () => {
  // Chạy song song tất cả các luồng đếm để tối ưu hiệu năng
  const [totalHouseholds, totalPeople, genderStats, residencyStats, ageStats] =
    await Promise.all([
      // 1. Tổng số hộ khẩu
      Household.count(),

      // 2. Tổng số nhân khẩu (Loại bỏ người đã mất - 'deceased')
      Person.count({
        where: { residency_status: { [Op.ne]: "deceased" } },
      }),

      // 3. Thống kê theo Giới tính (Group By Gender)
      Person.findAll({
        attributes: [
          "gender",
          [db.sequelize.fn("COUNT", db.sequelize.col("person_id")), "count"],
        ],
        where: { residency_status: { [Op.ne]: "deceased" } }, // Chỉ đếm người còn sống
        group: ["gender"],
        raw: true,
      }),

      // 4. Thống kê theo Cư trú (Group By Status)
      Person.findAll({
        attributes: [
          "residency_status",
          [db.sequelize.fn("COUNT", db.sequelize.col("person_id")), "count"],
        ],
        where: { residency_status: { [Op.ne]: "deceased" } },
        group: ["residency_status"],
        raw: true,
      }),

      // 5. Thống kê Độ tuổi (Theo các mốc: Mầm non, Học sinh, Lao động, Nghỉ hưu)
      (async () => {
        const date6 = getDateFromAge(6); // Mốc 6 tuổi
        const date19 = getDateFromAge(19); // Mốc 19 tuổi
        const date61 = getDateFromAge(61); // Mốc 60 tuổi

        // Logic so sánh ngày sinh (dob):
        // - Người < 6 tuổi => Sinh SAU ngày date6 (dob > date6)
        // - Người > 60 tuổi => Sinh TRƯỚC ngày date60 (dob < date60)
        const [mamNon, hocSinh, laoDong, nghiHuu] = await Promise.all([
          Person.count({
            where: {
              dob: { [Op.gt]: date6 },
              residency_status: { [Op.ne]: "deceased" },
            },
          }),
          Person.count({
            where: {
              dob: { [Op.between]: [date19, date6] },
              residency_status: { [Op.ne]: "deceased" },
            },
          }),
          Person.count({
            where: {
              dob: { [Op.between]: [date61, date19] },
              residency_status: { [Op.ne]: "deceased" },
            },
          }),
          Person.count({
            where: {
              dob: { [Op.lt]: date61 },
              residency_status: { [Op.ne]: "deceased" },
            },
          }),
        ]);

        return { mamNon, hocSinh, laoDong, nghiHuu };
      })(),
    ]);

  // --- XỬ LÝ DỮ LIỆU ĐẦU RA (FORMATTING) ---
  // Chuyển đổi dữ liệu thô từ Database sang format JSON đẹp cho Frontend

  // Map dữ liệu giới tính
  const genderMap = { nam: 0, nu: 0, khac: 0 };
  genderStats.forEach((item) => {
    if (item.gender === "male") genderMap.nam = parseInt(item.count);
    else if (item.gender === "female") genderMap.nu = parseInt(item.count);
    else genderMap.khac += parseInt(item.count);
  });

  // Map dữ liệu cư trú
  // Dựa trên ENUM: permanent, temporary_resident, temporary_absent
  const residencyMap = { thuongTru: 0, tamTru: 0, tamVang: 0 };
  residencyStats.forEach((item) => {
    if (item.residency_status === "permanent")
      residencyMap.thuongTru = parseInt(item.count);
    else if (item.residency_status === "temporary_resident")
      residencyMap.tamTru = parseInt(item.count);
    else if (item.residency_status === "temporary_absent")
      residencyMap.tamVang = parseInt(item.count);
  });

  return {
    tongSoHoKhau: totalHouseholds,
    tongSoNhanKhau: totalPeople,
    thongKeGioiTinh: genderMap,
    thongKeDoTuoi: ageStats,
    thongKeCuTru: residencyMap,
  };
};

export default {
  getDashboardStats,
};
