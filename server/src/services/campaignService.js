import db from "../models/index.js";
import { Op } from "sequelize";

const Campaign = db.Campaign;
const CampaignPayment = db.CampaignPayment;
const Household = db.Household;

// // 1. Tạo đợt vận động mới
// const createCampaign = async (data) => {
//   // Tạo Campaign, không tạo Payment vì đây là tự nguyện
//   return await Campaign.create(data);
// };

// 1. Tạo đợt vận động mới
const createCampaign = async (data) => {
  const payload = {
    ...data,
    // FE gửi description, DB lưu note
    note: data.note ?? data.description ?? null,
  };

  // tránh lưu dư field description nếu model không có
  delete payload.description;

  return await Campaign.create(payload);
};


// 2. Lấy danh sách các đợt vận động
const getAllCampaigns = async () => {
  return await Campaign.findAll({
    order: [["start_date", "DESC"]],
  });
};

// 3. Xem chi tiết 1 đợt (kèm danh sách các hộ đã đóng)
const getCampaignDetail = async (id) => {
  const campaign = await Campaign.findByPk(id, {
    include: [
      {
        model: CampaignPayment,
        as: "contributions",
        include: [
          {
            model: Household,
            as: "household",
            attributes: ["household_no", "head_person_id", "address"],
          },
        ],
      },
    ],
  });

  if (!campaign) {
    throw new Error("Chiến dịch không tồn tại");
  }

  // B. Tính tổng số tiền đã quyên góp được (Aggregation)
  const totalCollected = await CampaignPayment.sum("amount", {
    where: { campaign_id: id },
  });

  // Trả về dữ liệu đã gộp
  return {
    ...campaign.toJSON(),
    total_collected: totalCollected || 0,
  };
};

// // 4. Cập nhật thông tin đợt vận động
// const updateCampaign = async (id, data) => {
//   const campaign = await Campaign.findByPk(id);
//   if (!campaign) {
//     throw new Error("Chiến dịch không tồn tại");
//   }
//   return await Campaign.update(data);
// };

// 4. Cập nhật thông tin đợt vận động
const updateCampaign = async (id, data) => {
  const campaign = await Campaign.findByPk(id);
  if (!campaign) throw new Error("Chiến dịch không tồn tại");

  const payload = {
    ...data,
    note: data.note ?? data.description ?? campaign.note,
  };
  delete payload.description;

  await campaign.update(payload);
  return campaign;
};


// 5. Xóa đợt vận động
const deleteCampaign = async (id) => {
  // DB để ON DELETE CASCADE nên xóa Campaign sẽ tự xóa Payment
  const result = await Campaign.destroy({ where: { campaign_id: id } });
  if (!result) throw new Error("Không tìm thấy chiến dịch để xóa");
  return true;
};

// 6. Ghi nhận đóng góp (Tự động cộng dồn nếu đã tồn tại)
const recordContribution = async (data) => {
  const {
    campaign_id,
    household_id,
    amount,
    contribution_date = new Date(),
    note,
  } = data;

  // --- BƯỚC 1: VALIDATION (KIỂM TRA HỢP LỆ) ---

  // 1.1 Kiểm tra chiến dịch có tồn tại không?
  const campaign = await Campaign.findByPk(campaign_id);
  if (!campaign) {
    throw new Error("Chiến dịch vận động không tồn tại!");
  }

  // 1.2 Kiểm tra thời gian chiến dịch
  const donateDate = new Date(contribution_date);
  const startDate = new Date(campaign.start_date);

  // Nếu chiến dịch có ngày kết thúc, kiểm tra xem đã hết hạn chưa
  if (campaign.end_date) {
    const endDate = new Date(campaign.end_date);
    if (donateDate > endDate) {
      throw new Error(
        `Chiến dịch đã kết thúc vào ngày ${campaign.end_date}. Không thể tiếp nhận đóng góp mới.`
      );
    }
  }

  if (donateDate < startDate) {
    throw new Error(
      `Chiến dịch chưa bắt đầu (Ngày bắt đầu: ${campaign.start_date}).`
    );
  }

  // 1.3 Kiểm tra hộ khẩu có tồn tại không?
  const household = await Household.findByPk(household_id);
  if (!household) {
    throw new Error("Hộ khẩu không tồn tại trong hệ thống!");
  }

  // --- BƯỚC 2: XỬ LÝ GHI NHẬN ---

  // 1. Kiểm tra xem hộ này đã có bản ghi trong chiến dịch này chưa
  let contribution = await CampaignPayment.findOne({
    where: {
      campaign_id: campaign_id,
      household_id: household_id,
    },
  });

  if (contribution) {
    // --- TRƯỜNG HỢP A: ĐÃ TỒN TẠI -> CỘNG DỒN ---

    const contributeAmount = amount;

    // Tính tổng tiền mới
    const newAmount = parseFloat(contribution.amount) + parseFloat(amount);

    // Cập nhật lại
    await contribution.update({
      amount: newAmount,
      contribution_date: contribution_date,
      status: "paid", // Mặc định đóng tiền là 'paid'
      note: note ? `${contribution.note || ""} | ${note}` : contribution.note, // Ghi nối thêm note nếu có
    });

    return {
      action: "updated",
      data: {
        campaign_name: campaign.name,
        household_no: household.household_no,
        contributeAmount,
        ...contribution.get({ plain: true }),
      },
    };
  } else {
    // --- TRƯỜNG HỢP B: CHƯA CÓ -> TẠO MỚI ---
    const newContribution = await CampaignPayment.create({
      campaign_id,
      household_id,
      amount,
      contribution_date,
      status: "paid",
      note,
    });

    return {
      action: "created",
      data: {
        campaign_name: campaign.name,
        household_no: household.household_no,
        ...newContribution.get({ plain: true }),
      },
    };
  }
};

export default {
  createCampaign,
  getAllCampaigns,
  getCampaignDetail,
  updateCampaign,
  deleteCampaign,
  recordContribution,
};
