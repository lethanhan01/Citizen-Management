import db from "../models/index.js";
import { Op } from "sequelize";

const Person = db.Person;
const Household = db.Household;
const FeeRate = db.FeeRate;
const Payment = db.Payment;
const Campaign = db.Campaign;
const CampaignPayment = db.CampaignPayment;

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

const getFeeCollectionReport = async (rateId) => {
  // 1. Kiểm tra khoản thu có tồn tại không
  const feeRate = await FeeRate.findByPk(rateId);
  if (!feeRate) {
    throw new Error("Khoản thu không tồn tại!");
  }

  // 2. Thực hiện các phép tính toán tổng hợp (Aggregation)
  // Dùng Promise.all để chạy song song
  const [
    totalExpected, // Tổng tiền CẦN thu
    totalCollected, // Tổng tiền ĐÃ thu (bao gồm cả nộp một phần)
    countPaid, // Số hộ đã hoàn thành
    countPartial, // Số hộ đang nộp dở dang
    countPending, // Số hộ chưa nộp đồng nào
  ] = await Promise.all([
    Payment.sum("total_amount", { where: { rate_id: rateId } }),
    Payment.sum("paid_amount", { where: { rate_id: rateId } }),
    Payment.count({ where: { rate_id: rateId, payment_status: "paid" } }),
    Payment.count({ where: { rate_id: rateId, payment_status: "partial" } }),
    Payment.count({ where: { rate_id: rateId, payment_status: "pending" } }),
  ]);

  // 3. Lấy danh sách các hộ CHƯA hoàn thành (Pending + Partial)
  // Để kế toán in danh sách đi thu tiền
  const unpaidHouseholds = await Payment.findAll({
    where: {
      rate_id: rateId,
      payment_status: { [Op.ne]: "paid" },
    },
    include: [
      {
        model: Household,
        as: "household",
        attributes: ["household_no", "address"],
      },
    ],
    attributes: ["total_amount", "paid_amount", "payment_status"],
    order: [["household_id", "ASC"]],
  });

  // Format lại danh sách hộ nợ
  const formattedUnpaidList = unpaidHouseholds.map((p) => ({
    household_no: p.household.household_no,
    address: p.household.address,
    must_pay: parseInt(p.total_amount),
    paid: parseInt(p.paid_amount),
    debt: parseInt(p.total_amount) - parseInt(p.paid_amount), // Số tiền còn nợ
    status: p.payment_status, // 'pending' hoặc 'partial'
  }));

  return {
    tenKhoanThu: feeRate.item_type,
    tongSoTienCanThu: totalExpected || 0,
    tongSoTienDaThu: totalCollected || 0,
    tienDoHoanThanh: countPaid,
    soHoChuaNop: countPending + countPartial, // Gộp cả chưa nộp và nộp thiếu
    chiTietTrangThai: {
      daNopDu: countPaid,
      nopThieu: countPartial,
      chuaNop: countPending,
    },
    danhSachHoChuaNop: formattedUnpaidList,
  };
};

const getFullFeeCollectionReport = async (rateId) => {
  // 1. Kiểm tra khoản thu có tồn tại không
  const feeRate = await FeeRate.findByPk(rateId);
  if (!feeRate) {
    throw new Error("Khoản thu không tồn tại!");
  }

  // 2. Thực hiện các phép tính toán tổng hợp (Aggregation)
  // Dùng Promise.all để chạy song song
  const [
    totalExpected, // Tổng tiền CẦN thu
    totalCollected, // Tổng tiền ĐÃ thu (bao gồm cả nộp một phần)
    countPaid, // Số hộ đã hoàn thành
    countPartial, // Số hộ đang nộp dở dang
    countPending, // Số hộ chưa nộp đồng nào
  ] = await Promise.all([
    Payment.sum("total_amount", { where: { rate_id: rateId } }),
    Payment.sum("paid_amount", { where: { rate_id: rateId } }),
    Payment.count({ where: { rate_id: rateId, payment_status: "paid" } }),
    Payment.count({ where: { rate_id: rateId, payment_status: "partial" } }),
    Payment.count({ where: { rate_id: rateId, payment_status: "pending" } }),
  ]);

  // 3. Lấy danh sách TOÀN BỘ
  const allHouseholds = await Payment.findAll({
    where: { rate_id: rateId },
    include: [
      {
        model: Household,
        as: "household",
        attributes: ["household_no", "address"],
      },
    ],
    order: [
      ["payment_status", "ASC"],
      ["household_id", "ASC"],
    ],
  });

  // Format dữ liệu
  const formattedList = allHouseholds.map((p) => ({
    household_no: p.household.household_no,
    address: p.household.address,
    must_pay: parseInt(p.total_amount),
    paid: parseInt(p.paid_amount),
    debt: parseInt(p.total_amount) - parseInt(p.paid_amount),
    status: p.payment_status,
    date: p.date,
  }));

  return {
    tenKhoanThu: feeRate.item_type,
    tongSoTienCanThu: totalExpected || 0,
    tongSoTienDaThu: totalCollected || 0,
    tienDoHoanThanh: countPaid,
    soHoChuaNop: countPending + countPartial,
    danhSachChiTiet: formattedList,
  };
};

const getDonationReport = async (campaignId) => {
  // 1. Kiểm tra đợt vận động có tồn tại không
  const campaign = await Campaign.findByPk(campaignId);
  if (!campaign) {
    throw new Error("Đợt vận động không tồn tại!");
  }

  // 2. Tính toán tổng hợp (Aggregation)
  // Chạy song song để lấy Tổng tiền và Số hộ tham gia
  const [totalCollected, countParticipants] = await Promise.all([
    CampaignPayment.sum("amount", { where: { campaign_id: campaignId } }),
    CampaignPayment.count({ where: { campaign_id: campaignId } }),
  ]);

  // 3. Lấy danh sách chi tiết các hộ đã đóng góp
  // Sắp xếp theo số tiền đóng góp giảm dần (ai đóng nhiều lên đầu) để vinh danh
  const donors = await CampaignPayment.findAll({
    where: { campaign_id: campaignId },
    include: [
      {
        model: Household,
        as: "household",
        attributes: ["household_no", "address"], // Lấy thông tin hộ
      },
    ],
    order: [["amount", "DESC"]], // Sắp xếp giảm dần theo số tiền
    attributes: ["amount", "contribution_date", "note"],
  });

  // Format lại dữ liệu cho gọn gàng
  const formattedDonors = donors.map((d) => ({
    household_no: d.household.household_no,
    address: d.household.address,
    amount: parseInt(d.amount),
    date: d.contribution_date,
    note: d.note,
  }));

  return {
    tenDotVanDong: campaign.name,
    tongTienThuDuoc: totalCollected || 0,
    soHoThamGia: countParticipants,
    danhSachDongGop: formattedDonors,
  };
};

export default {
  getDashboardStats,
  getFeeCollectionReport,
  getDonationReport,
  getFullFeeCollectionReport
};
