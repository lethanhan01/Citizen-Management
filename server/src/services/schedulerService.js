import cron from "node-cron";
import { Op } from "sequelize";
import db from "../models/index.js";

const { TempResidence, Person, sequelize } = db;

// Hàm xử lý logic cập nhật
const scanAndRevertTempAbsence = async () => {
  console.log("***Bắt đầu quét các hồ sơ tạm vắng hết hạn...");
  const t = await sequelize.transaction();

  try {
    const today = new Date();
    // Đưa về đầu ngày để so sánh chính xác (00:00:00)
    today.setHours(0, 0, 0, 0);

    // 1. Tìm các bản ghi tạm vắng đã hết hạn tính đến hôm nay
    const expiredRecords = await TempResidence.findAll({
      where: {
        type: "TEMPORARY_ABSENCE",
        status: "ACTIVE",
        to_date: {
          [Op.lt]: today, // to_date < hôm nay => đã hết hạn
        },
      },
      transaction: t,
    });

    if (expiredRecords.length === 0) {
      console.log("Không có hồ sơ nào hết hạn hôm nay.");
      await t.commit();
      return;
    }

    // Lấy danh sách person_id cần khôi phục
    const personIds = expiredRecords.map((r) => r.person_id);

    // 2. Cập nhật trạng thái Person về 'permanent' (Thường trú)
    await Person.update(
      { residency_status: "permanent" },
      {
        where: {
          person_id: { [Op.in]: personIds },
        },
        transaction: t,
      }
    );

    // 3. Đánh dấu bản ghi TempResidence là đã hoàn tất/hết hạn
    // Để lần quét sau không quét lại nữa
    await TempResidence.update(
      { status: "EXPIRED" }, // Bạn cần chắc chắn enum status có giá trị này, hoặc dùng 'COMPLETED'
      {
        where: {
          temp_residence_id: { [Op.in]: expiredRecords.map((r) => r.temp_residence_id) },
        },
        transaction: t,
      }
    );

    await t.commit();
    console.log(`Đã khôi phục trạng thái cho ${personIds.length} công dân hết hạn tạm vắng.`);
  } catch (error) {
    await t.rollback();
    console.error("Lỗi khi quét hồ sơ tạm vắng:", error);
  }
};

// Hàm khởi tạo Cron Job
export const initScheduledJobs = () => {
  // Chạy vào 0 giờ 1 phút mỗi ngày: "1 0 * * *"
  cron.schedule("1 0 * * *", () => {
    scanAndRevertTempAbsence();
  });
  
  console.log("Scheduler service đã được khởi động (Lịch chạy: 00:01 AM).");
};