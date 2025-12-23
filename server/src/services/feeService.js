import db from "../models/index.js";
import { Op } from "sequelize";

const FeeRate = db.FeeRate;
const Payment = db.Payment;
const Household = db.Household;
const Person = db.Person;

// 1. Tạo đợt thu phí mới (VD: Phí vệ sinh 2025)
const createFeeWave = async (data) => {
  // Dùng transaction để đảm bảo tính toàn vẹn dữ liệu
  // Nếu tạo payment lỗi thì rollback luôn việc tạo FeeRate
  const t = await db.sequelize.transaction();

  try {
    console.log("--- BẮT ĐẦU TẠO ĐỢT THU ---");
    // A. Tạo bản ghi FeeRate (Đợt thu)
    const newFee = await FeeRate.create(
      {
        item_type: data.item_type, // "Phí vệ sinh 2025"
        unit_type: data.unit_type, // "per_person"
        amount: data.amount, // 6000
        effective_from: data.effective_from,
        effective_to: data.effective_to,
        note: data.note,
      },
      { transaction: t }
    );

    console.log("1. Đã tạo FeeRate ID:", newFee.rate_id);

    // B. Lấy danh sách tất cả các hộ khẩu đang hoạt động
    // Include Person để đếm số nhân khẩu
    const allHouseholds = await Household.findAll({
      include: [
        {
          model: Person,
          as: "residents",
          // Chỉ đếm những người đang thường trú/tạm trú (tuỳ nghiệp vụ, ở đây mình đếm hết)
          attributes: ["person_id"],
        },
      ],
    });

    if (allHouseholds.length === 0) {
      console.log(
        "CẢNH BÁO: Không tìm thấy hộ khẩu nào trong DB! Hãy kiểm tra lại bảng 'core.household'"
      );
    }

    // C. Chuẩn bị dữ liệu Payment cho từng hộ
    const paymentRecords = allHouseholds.map((household) => {
      let totalAmount = 0;
      const memberCount = household.residents.length;

      // Logic tính tiền
      if (newFee.unit_type === "per_person") {
        // Công thức: 6000 * 12 tháng * số người
        // Ở đây giả sử amount nhập vào là 6000 (đơn giá tháng)
        // Hoặc nếu amount là trọn gói năm thì bỏ * 12 đi.
        // Theo mô tả: 6.000 / 1 tháng / 1 người => Phải nhân 12
        totalAmount = parseFloat(newFee.amount) * 12 * memberCount;
      } else {
        // Tính theo hộ
        totalAmount = parseFloat(newFee.amount);
      }

      return {
        household_id: household.household_id,
        rate_id: newFee.rate_id,
        year: new Date(newFee.effective_from).getFullYear(),
        payment_status: "pending",
        total_amount: totalAmount,
        date: new Date(),
        note: `Thu phí vệ sinh cho ${memberCount} nhân khẩu của hộ gia đình`,
      };
    });

    // D. Insert vào bảng Payment
    if (paymentRecords.length > 0) {
      await Payment.bulkCreate(paymentRecords, { transaction: t });
    }

    // Commit transaction (Lưu vào DB)
    await t.commit();

    return newFee;
  } catch (error) {
    console.error("LỖI TRONG TRANSACTION:", error);
    // Nếu có lỗi, hoàn tác tất cả
    await t.rollback();
    throw error;
  }
};

// 2. Lấy danh sách các khoản thu
const getAllFeeWaves = async () => {
  return await FeeRate.findAll({
    order: [["effective_from", "DESC"]],
  });
};

// 3. Xóa bản ghi
const deleteFeeWave = async (rateId) => {
  // Khởi tạo Transaction
  const t = await db.sequelize.transaction();
  try {
    // 1. Tìm đợt thu xem có tồn tại không
    const feeRate = await FeeRate.findByPk(rateId);
    if (!feeRate) {
      throw new Error("Khoản thu không tồn tại!");
    }

    // 2. CẢNH BÁO (Optional): Kiểm tra xem có ai đóng tiền chưa?
    // Nếu muốn chặt chẽ, bạn có thể chặn xóa nếu đã có người nộp tiền.
    // Ở đây mình bỏ qua để bạn dễ dàng dọn rác test.

    // 3. Xóa tất cả các phiếu thu (Payment) liên quan trước
    // (Do DB cấu hình SET NULL nên ta phải xóa tay bước này)
    await Payment.destroy({
      where: { rate_id: rateId },
      transaction: t,
    });

    // 4. Xóa đợt thu (FeeRate)
    await feeRate.destroy({ transaction: t });

    // 5. Xác nhận thành công
    await t.commit();
    return true;
  } catch (error) {
    // Nếu có lỗi, hoàn tác (không xóa gì cả)
    await t.rollback();
    throw error;
  }
};

const getPaymentList = async (queryParams) => {
  const { rate_id, status, keyword, page = 1, limit = 10 } = queryParams;

  const offset = (page - 1) * limit;

  // A. Xây dựng điều kiện lọc cho bảng Payment
  let paymentWhere = {};

  if (rate_id) {
    paymentWhere.rate_id = rate_id;
  }

  if (status) {
    paymentWhere.payment_status = status;
  }

  // B. Xây dựng điều kiện lọc cho bảng Household (Tìm theo số hộ khẩu)
  let householdWhere = {};

  if (keyword) {
    // Tìm keyword trong household_no HOẶC payer_name (ở bảng Payment)
    // Vì payer_name nằm ở bảng Payment, household_no nằm ở bảng Household
    // nên ta xử lý logic OR này hơi khéo léo một chút:
    // Nếu keyword nhìn giống số hộ khẩu (HK...) thì tìm ở Household
    // Nếu không thì tìm tên người nộp ở Payment.
    if (keyword.toUpperCase().startsWith("HK")) {
      householdWhere.household_no = { [Op.iLike]: `%${keyword}` };
    } else {
      paymentWhere.payer_name = { [Op.iLike]: `%${keyword}` };
    }
  }

  // C. Query 1: Thực hiện truy vấn
  const { count, rows } = await Payment.findAndCountAll({
    where: paymentWhere,
    include: [
      {
        model: Household,
        as: "household",
        attributes: ["household_no", "address", "head_person_id"],
        where: Object.keys(householdWhere).length > 0 ? householdWhere : null,
        required: Object.keys(householdWhere).length > 0,
      },
      {
        model: FeeRate,
        as: "feeRate",
        attributes: ["item_type", "amount"],
      },
    ],
    order: [
      ["payment_status", "ASC"],
      ["household_id", "ASC"],
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  // D. Query 2: Tính tổng tiền toàn bộ
  // Hàm này sẽ bỏ qua limit/offset, tính tổng trên toàn bộ dữ liệu tìm thấy
  const totalRevenue = await Payment.sum("total_amount", {
    where: paymentWhere, // Vẫn giữ điều kiện lọc (ví dụ: chỉ tính tổng những người 'paid')
    include: [
      // Nếu điều kiện lọc nằm ở bảng Household (như tìm theo keyword HK...),
      // ta bắt buộc phải include Household vào đây thì mới lọc đúng được.
      {
        model: Household,
        as: "household",
        where: Object.keys(householdWhere).length > 0 ? householdWhere : null,
        required: Object.keys(householdWhere).length > 0,
        attributes: []
      },
    ],
  });

  return {
    totalRecords: count,
    totalRevenue: totalRevenue || 0,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    data: rows,
  };
};

export default {
  createFeeWave,
  getAllFeeWaves,
  deleteFeeWave,
  getPaymentList,
};
