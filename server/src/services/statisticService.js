import db from "../models/index.js";
import { Op } from "sequelize";

const Person = db.Person;
const Household = db.Household;
const FeeRate = db.FeeRate;
const Payment = db.Payment;
const Campaign = db.Campaign;
const CampaignPayment = db.CampaignPayment;

// Hàm phụ trợ: Tính mốc ngày sinh từ số tuổi
const getDateFromAge = (age) => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - age);
  return date;
};

const getDashboardStats = async () => {
  // 1. Chuẩn bị mốc thời gian
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11
  const startOfYear = new Date(currentYear, 0, 1);
  const startOfMonth = new Date(currentYear, currentMonth, 1);

  // 2. Định nghĩa các Promise

  // --- LUỒNG 1: DÂN CƯ ---
  const citizenPromise = Promise.all([
    Household.count(),
    Person.count({ where: { residency_status: { [Op.ne]: "deceased" } } }),

    // Giới tính
    Person.findAll({
      attributes: [
        "gender",
        [db.sequelize.fn("COUNT", db.sequelize.col("person_id")), "count"],
      ],
      where: { residency_status: { [Op.ne]: "deceased" } },
      group: ["gender"],
      raw: true,
    }),

    // Cư trú
    Person.findAll({
      attributes: [
        "residency_status",
        [db.sequelize.fn("COUNT", db.sequelize.col("person_id")), "count"],
      ],
      where: { residency_status: { [Op.ne]: "deceased" } },
      group: ["residency_status"],
      raw: true,
    }),

    // Độ tuổi
    (async () => {
      const date6 = getDateFromAge(6);
      const date19 = getDateFromAge(19);
      const date61 = getDateFromAge(61);
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

  // --- LUỒNG 2: TÀI CHÍNH (Đã sửa updatedAt -> date) ---
  const financialPromise = Promise.all([
    // 0. Tổng tiền ĐÃ THU trong THÁNG NÀY (Dùng 'date')
    Payment.sum("paid_amount", { where: { date: { [Op.gte]: startOfMonth } } }),

    // 1. Tổng tiền CẦN THU (Công nợ) của NĂM NAY (Dùng 'date' hoặc 'createdAt' tùy DB, ở đây dùng 'date' cho đồng bộ)
    Payment.sum("total_amount", { where: { date: { [Op.gte]: startOfYear } } }),

    // 2. Tổng tiền ĐÃ THU của NĂM NAY
    Payment.sum("paid_amount", { where: { date: { [Op.gte]: startOfYear } } }),

    // 3. Trạng thái thu (Pie Chart)
    db.Payment.count({
      attributes: ["payment_status"],
      where: { date: { [Op.gte]: startOfYear } },
      group: ["payment_status"],
    }),

    // 4. Doanh thu 12 tháng (Bar Chart) - Lấy cột 'date' thay vì 'updatedAt'
    db.Payment.findAll({
      attributes: ["paid_amount", "date"],
      where: {
        payment_status: { [Op.ne]: "pending" },
        date: { [Op.gte]: startOfYear },
      },
      raw: true,
    }),

    // 5. Top Chiến dịch
    db.Campaign.findAll({
      attributes: [
        "name",
        [
          db.sequelize.fn("SUM", db.sequelize.col("contributions.amount")),
          "totalCollected",
        ],
      ],
      include: [
        {
          model: db.CampaignPayment,
          as: "contributions",
          attributes: [],
        },
      ],
      group: ["Campaign.campaign_id", "Campaign.name"],
      order: [[db.sequelize.literal('"totalCollected"'), "DESC"]],
      limit: 4,
      subQuery: false,
      raw: true,
    }),

    // 6. Giao dịch gần nhất (Dùng 'date' để sắp xếp)
    db.Payment.findAll({
      where: { payment_status: { [Op.or]: ["paid", "partial"] } },
      order: [["date", "DESC"]], // Sắp xếp theo ngày 'date'
      limit: 5,
      include: [
        { model: db.Household, as: "household", attributes: ["household_no"] },
        { model: db.FeeRate, as: "feeRate", attributes: ["item_type"] },
      ],
    }),
  ]);

  // 3. AWAIT TẤT CẢ
  const [
    [totalHouseholds, totalPeople, genderStats, residencyStats, ageStats],
    [
      sumPaidThisMonth,
      sumExpectedYear,
      sumPaidYear,
      statusCounts,
      monthlyPayments,
      topCampaigns,
      recentTrans,
    ],
  ] = await Promise.all([citizenPromise, financialPromise]);

  // 4. Format dữ liệu

  // -- Format Dân cư --
  const genderMap = { nam: 0, nu: 0, khac: 0 };
  genderStats.forEach((item) => {
    if (item.gender === "male") genderMap.nam = parseInt(item.count);
    else if (item.gender === "female") genderMap.nu = parseInt(item.count);
    else genderMap.khac += parseInt(item.count);
  });

  const residencyMap = { thuongTru: 0, tamTru: 0, tamVang: 0 };
  residencyStats.forEach((item) => {
    if (item.residency_status === "permanent")
      residencyMap.thuongTru = parseInt(item.count);
    else if (item.residency_status === "temporary_resident")
      residencyMap.tamTru = parseInt(item.count);
    else if (item.residency_status === "temporary_absent")
      residencyMap.tamVang = parseInt(item.count);
  });

  // -- Format Tài chính --
  const tongThuThangNay = sumPaidThisMonth || 0;
  const tongDaThuNamNay = sumPaidYear || 0;
  const tongCanThuNamNay = sumExpectedYear || 0;
  const tongNoNamNay = tongCanThuNamNay - tongDaThuNamNay;

  // Pie Chart
  let daHoanThanh = 0;
  let nopMotPhan = 0;
  let chuaNop = 0;
  statusCounts.forEach((item) => {
    const count = parseInt(item.count || 0);
    if (item.payment_status === "paid") {
      daHoanThanh = count;
    } else if (item.payment_status === "partial") {
      nopMotPhan = count;
    } else {
      // payment_status === 'pending'
      chuaNop = count;
    }
  });

  // Bar Chart (12 tháng)
  const monthlyRevenue = Array(12).fill(0);
  monthlyPayments.forEach((p) => {
    if (p.date) {
      // Dùng p.date
      const monthIndex = new Date(p.date).getMonth();
      monthlyRevenue[monthIndex] += Number(p.paid_amount || 0);
    }
  });

  // Campaign Chart
  const formattedCampaigns = topCampaigns.map((c) => ({
    tenChienDich: c.name,
    soTien: Number(c.totalCollected || 0),
  }));

  // Table Giao dịch
  const formattedRecent = recentTrans.map((t) => ({
    household_no: t.household?.household_no || "N/A",
    khoan_thu: t.feeRate?.item_type || "Khoản thu",
    so_tien: Number(t.paid_amount || 0),
    trang_thai: t.payment_status === "paid" ? "Đã thu" : "Nộp một phần",
    ngay_thu: t.date ? new Date(t.date).toLocaleDateString("vi-VN") : "N/A", // Dùng t.date
  }));

  return {
    tongSoHoKhau: totalHouseholds,
    tongSoNhanKhau: totalPeople,
    thongKeGioiTinh: genderMap,
    thongKeDoTuoi: ageStats,
    thongKeCuTru: residencyMap,
    thongKeTaiChinh: {
      tongThuThangNay,
      tongDaThuNamNay,
      tongCanThuNamNay,
      tongChuaThu: tongNoNamNay,
      doanhThuTheoThang: monthlyRevenue,
      trangThaiThu: {
        daHoanThanh,
        nopMotPhan,
        chuaNop,
      },
      topChienDich: formattedCampaigns,
      giaoDichGanNhat: formattedRecent,
    },
  };
};

// Các hàm khác giữ nguyên (chỉ review nhẹ)
const getFeeCollectionReport = async (rateId) => {
  const feeRate = await FeeRate.findByPk(rateId);
  if (!feeRate) throw new Error("Khoản thu không tồn tại!");

  const [totalExpected, totalCollected, countPaid, countPartial, countPending] =
    await Promise.all([
      Payment.sum("total_amount", { where: { rate_id: rateId } }),
      Payment.sum("paid_amount", { where: { rate_id: rateId } }),
      Payment.count({ where: { rate_id: rateId, payment_status: "paid" } }),
      Payment.count({ where: { rate_id: rateId, payment_status: "partial" } }),
      Payment.count({ where: { rate_id: rateId, payment_status: "pending" } }),
    ]);

  const unpaidHouseholds = await Payment.findAll({
    where: { rate_id: rateId, payment_status: { [Op.ne]: "paid" } },
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

  return {
    tenKhoanThu: feeRate.item_type,
    tongSoTienCanThu: totalExpected || 0,
    tongSoTienDaThu: totalCollected || 0,
    tienDoHoanThanh: countPaid,
    soHoChuaNop: countPending + countPartial,
    chiTietTrangThai: {
      daNopDu: countPaid,
      nopThieu: countPartial,
      chuaNop: countPending,
    },
    danhSachHoChuaNop: unpaidHouseholds.map((p) => ({
      household_no: p.household.household_no,
      address: p.household.address,
      must_pay: Number(p.total_amount || 0),
      paid: Number(p.paid_amount || 0),
      debt: Number(p.total_amount || 0) - Number(p.paid_amount || 0),
      status: p.payment_status,
    })),
  };
};

const getFullFeeCollectionReport = async (rateId) => {
  const feeRate = await FeeRate.findByPk(rateId);
  if (!feeRate) throw new Error("Khoản thu không tồn tại!");

  const [totalExpected, totalCollected, countPaid, countPartial, countPending] =
    await Promise.all([
      Payment.sum("total_amount", { where: { rate_id: rateId } }),
      Payment.sum("paid_amount", { where: { rate_id: rateId } }),
      Payment.count({ where: { rate_id: rateId, payment_status: "paid" } }),
      Payment.count({ where: { rate_id: rateId, payment_status: "partial" } }),
      Payment.count({ where: { rate_id: rateId, payment_status: "pending" } }),
    ]);

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

  return {
    tenKhoanThu: feeRate.item_type,
    tongSoTienCanThu: totalExpected || 0,
    tongSoTienDaThu: totalCollected || 0,
    tienDoHoanThanh: countPaid,
    soHoChuaNop: countPending + countPartial,
    danhSachChiTiet: allHouseholds.map((p) => ({
      household_no: p.household.household_no,
      address: p.household.address,
      must_pay: Number(p.total_amount || 0),
      paid: Number(p.paid_amount || 0),
      debt: Number(p.total_amount || 0) - Number(p.paid_amount || 0),
      status: p.payment_status,
      date: p.date,
    })),
  };
};

const getDonationReport = async (campaignId) => {
  const campaign = await Campaign.findByPk(campaignId);
  if (!campaign) throw new Error("Đợt vận động không tồn tại!");

  const [totalCollected, countParticipants] = await Promise.all([
    CampaignPayment.sum("amount", { where: { campaign_id: campaignId } }),
    CampaignPayment.count({ where: { campaign_id: campaignId } }),
  ]);

  const donors = await CampaignPayment.findAll({
    where: { campaign_id: campaignId },
    include: [
      {
        model: Household,
        as: "household",
        attributes: ["household_no", "address"],
      },
    ],
    order: [["amount", "DESC"]],
    attributes: ["amount", "contribution_date", "note"],
  });

  return {
    tenDotVanDong: campaign.name,
    tongTienThuDuoc: totalCollected || 0,
    soHoThamGia: countParticipants,
    danhSachDongGop: donors.map((d) => ({
      household_no: d.household.household_no,
      address: d.household.address,
      amount: Number(d.amount || 0),
      date: d.contribution_date,
      note: d.note,
    })),
  };
};

export default {
  getDashboardStats,
  getFeeCollectionReport,
  getDonationReport,
  getFullFeeCollectionReport,
};
