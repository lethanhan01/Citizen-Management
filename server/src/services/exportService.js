import ExcelJS from "exceljs";
import vnNum2Words from "vn-num2words";
import statisticService from "./statisticService.js";
import db from "../models/index.js";

const Payment = db.Payment;
const Household = db.Household;
const FeeRate = db.FeeRate;

// Hàm hỗ trợ format tiền tệ VNĐ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// 1. Xuất báo cáo thu phí (Dựa trên BE-21)
const exportFeeReportToExcel = async (rateId) => {
  // A. Lấy dữ liệu từ service thống kê cũ
  const reportData = await statisticService.getFeeCollectionReport(rateId);

  // B. Khởi tạo Workbook và Worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Báo cáo thu phí");

  // C. Định nghĩa các cột (Header)
  worksheet.columns = [
    { header: "STT", key: "stt", width: 5 },
    { header: "Số Hộ Khẩu", key: "household_no", width: 15 },
    { header: "Địa Chỉ", key: "address", width: 30 },
    { header: "Phải Nộp", key: "must_pay", width: 15 },
    { header: "Đã Nộp", key: "paid", width: 15 },
    { header: "Còn Nợ", key: "debt", width: 15 },
    { header: "Trạng Thái", key: "status", width: 15 },
  ];

  // D. Thêm dòng tiêu đề lớn ở trên cùng (Optional - cho đẹp)
  worksheet.insertRow(1, [
    `BÁO CÁO THU: ${reportData.tenKhoanThu.toUpperCase()}`,
  ]);
  worksheet.mergeCells("A1:G1"); // Gộp ô
  worksheet.getCell("A1").font = { size: 16, bold: true };
  worksheet.getCell("A1").alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  // Thêm dòng thống kê tổng quan
  worksheet.insertRow(2, [
    `Tổng cần thu: ${formatCurrency(
      reportData.tongSoTienCanThu
    )} - Đã thu: ${formatCurrency(reportData.tongSoTienDaThu)}`,
  ]);
  worksheet.mergeCells("A2:G2");
  worksheet.getCell("A2").alignment = { horizontal: "center" };

  // E. Duyệt danh sách nợ và thêm vào Excel
  let counter = 1;
  reportData.danhSachHoChuaNop.forEach((item) => {
    worksheet.addRow({
      stt: counter++,
      household_no: item.household_no,
      address: item.address,
      must_pay: item.must_pay, // Để số thô để Excel tính toán được
      paid: item.paid,
      debt: item.debt,
      status: item.status === "pending" ? "Chưa đóng" : "Đóng thiếu",
    });
  });

  // F. Style lại Header bảng (Dòng 4 sau khi insert 2 dòng tiêu đề + 1 dòng trống)
  const headerRow = worksheet.getRow(3);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0070C0" }, // Màu xanh dương
  };

  // G. Trả về Buffer
  return await workbook.xlsx.writeBuffer();
};

// 2. Xuất báo cáo đóng góp tự nguyện (Dựa trên BE-22)
const exportDonationReportToExcel = async (campaignId) => {
  const reportData = await statisticService.getDonationReport(campaignId);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Danh sách ủng hộ");

  worksheet.columns = [
    { header: "STT", key: "stt", width: 5 },
    { header: "Số Hộ Khẩu", key: "household_no", width: 15 },
    { header: "Địa Chỉ", key: "address", width: 30 },
    { header: "Số Tiền Đóng", key: "amount", width: 20 },
    { header: "Ngày Đóng", key: "date", width: 15 },
    { header: "Ghi Chú", key: "note", width: 25 },
  ];

  // Title
  worksheet.insertRow(1, [
    `DANH SÁCH ỦNG HỘ: ${reportData.tenDotVanDong.toUpperCase()}`,
  ]);
  worksheet.mergeCells("A1:F1");
  worksheet.getCell("A1").font = { size: 16, bold: true };
  worksheet.getCell("A1").alignment = { horizontal: "center" };

  let counter = 1;
  reportData.danhSachDongGop.forEach((item) => {
    worksheet.addRow({
      stt: counter++,
      household_no: item.household_no,
      address: item.address,
      amount: item.amount,
      date: item.date,
      note: item.note,
    });
  });

  // Style Header (Dòng 2 vì insert 1 dòng title)
  const headerRow = worksheet.getRow(2);
  headerRow.font = { bold: true };

  return await workbook.xlsx.writeBuffer();
};

// 3. Xuất Báo cáo Tổng hợp (Full Status)
const exportFullFeeReport = async (rateId) => {
  const reportData = await statisticService.getFullFeeCollectionReport(rateId);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Tổng hợp thu phí");

  // Header
  worksheet.columns = [
    { header: "STT", key: "stt", width: 5 },
    { header: "Số Hộ Khẩu", key: "household_no", width: 15 },
    { header: "Địa Chỉ", key: "address", width: 35 },
    { header: "Phải Nộp", key: "must_pay", width: 15 },
    { header: "Đã Nộp", key: "paid", width: 15 },
    { header: "Còn Nợ", key: "debt", width: 15 },
    { header: "Trạng Thái", key: "status", width: 15 },
    { header: "Ngày Nộp", key: "date", width: 15 },
  ];

  // Title
  worksheet.insertRow(1, [
    `BÁO CÁO TỔNG HỢP: ${reportData.tenKhoanThu.toUpperCase()}`,
  ]);
  worksheet.mergeCells("A1:H1");
  worksheet.getCell("A1").font = { size: 16, bold: true };
  worksheet.getCell("A1").alignment = { horizontal: "center" };

  // Dữ liệu
  let counter = 1;
  reportData.danhSachChiTiet.forEach((item) => {
    const row = worksheet.addRow({
      stt: counter++,
      household_no: item.household_no,
      address: item.address,
      must_pay: item.must_pay,
      paid: item.paid,
      debt: item.debt,
      status:
        item.status === "paid"
          ? "Đã xong"
          : item.status === "partial"
          ? "Thiếu"
          : "Chưa đóng",
      date: item.date,
    });

    // Tô màu dòng dựa theo trạng thái
    if (item.status === "paid") {
      // Màu xanh lá nhạt cho người đã đóng
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE2EFDA" },
        };
      });
    } else if (item.status === "pending") {
      // Màu đỏ nhạt cho người chưa đóng (để dễ nhìn thấy nợ)
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFCE4D6" },
        };
      });
    }
  });

  // Style Header
  const headerRow = worksheet.getRow(2); // Vì dòng 1 là title
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4472C4" },
  };

  return await workbook.xlsx.writeBuffer();
};

// 4. Xuất Phiếu Thu Hàng Loạt (Bulk Receipts)
const exportReceiptsForPrinting = async (rateId) => {
  const reportData = await statisticService.getFullFeeCollectionReport(rateId);

  // Chỉ lọc ra những người CÒN NỢ để in phiếu đi thu
  const debtors = reportData.danhSachChiTiet.filter(
    (item) => item.status !== "paid"
  );

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Phieu_Thu_In_Hang_Loat");

  // Cấu hình in: Căn lề vừa phải để in ra giấy A4 (hoặc A5)
  worksheet.pageSetup.paperSize = 9; // A4
  worksheet.pageSetup.margins = {
    left: 0.7,
    right: 0.7,
    top: 0.75,
    bottom: 0.75,
    header: 0.3,
    footer: 0.3,
  };

  // Logic: Vẽ từng phiếu thu nối tiếp nhau
  // Mỗi phiếu thu chiếm khoảng 8-10 dòng Excel
  let currentRow = 1;

  debtors.forEach((item, index) => {
    // --- BẮT ĐẦU VẼ 1 PHIẾU THU ---

    // 1. Viền trên cùng của phiếu
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value =
      "-------------------------------------------------------------";

    currentRow++;

    // 2. Tiêu đề Phiếu
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    const titleCell = worksheet.getCell(`A${currentRow}`);
    titleCell.value = `GIẤY BÁO NỘP TIỀN - ${reportData.tenKhoanThu.toUpperCase()}`;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: "center" };

    currentRow++;

    // 3. Thông tin hộ
    worksheet.getCell(
      `A${currentRow}`
    ).value = `Hộ khẩu số: ${item.household_no}`;
    worksheet.getCell(
      `D${currentRow}`
    ).value = `Mã phiếu: PT-${rateId}-${index}`; // Mã giả lập
    currentRow++;

    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = `Địa chỉ: ${item.address}`;
    currentRow++;

    // 4. Thông tin tiền
    worksheet.getCell(`A${currentRow}`).value = "Nội dung thu:";
    worksheet.getCell(`B${currentRow}`).value = reportData.tenKhoanThu;
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = "Số tiền phải nộp:";
    const moneyCell = worksheet.getCell(`B${currentRow}`);
    moneyCell.value = item.debt; // In số tiền còn nợ
    moneyCell.numFmt = '#,##0 "đ"';
    moneyCell.font = { bold: true, color: { argb: "FFFF0000" } }; // Màu đỏ
    currentRow++;

    // 5. Chữ ký (Để trống cho kế toán ký hoặc dân ký)
    currentRow++;
    worksheet.getCell(`A${currentRow}`).value = "Người nộp tiền";
    worksheet.getCell(`D${currentRow}`).value = "Người thu tiền";
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: "center" };
    worksheet.getCell(`D${currentRow}`).alignment = { horizontal: "center" };

    // Cách 3 dòng để ký
    currentRow += 4;

    // 6. Ngắt trang (Page Break) - Cứ 3 phiếu thì ngắt trang A4 1 lần (tùy chỉnh)
    // Hoặc đơn giản là để dòng kẻ cắt
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value =
      "✂ ..........................................................................................................";
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: "center" };

    currentRow += 2; // Cách ra một chút cho phiếu tiếp theo
  });

  // Set độ rộng cột cho đẹp
  worksheet.getColumn("A").width = 20;
  worksheet.getColumn("B").width = 25;
  worksheet.getColumn("C").width = 10;
  worksheet.getColumn("D").width = 20;
  worksheet.getColumn("E").width = 15;

  return await workbook.xlsx.writeBuffer();
};

// 5. Xuất hóa đơn cho hộ đã đóng (Đơn lẻ)
const exportSingleReceipt = async (paymentId) => {
  // A. Lấy dữ liệu
  const payment = await Payment.findByPk(paymentId, {
    include: [
      { model: Household, as: "household" },
      { model: FeeRate, as: "feeRate" },
    ],
  });

  if (!payment) throw new Error("Không tìm thấy phiếu thu!");

  // B. Tạo Workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Phieu_Thu");

  // Cấu hình trang in
  worksheet.pageSetup.paperSize = 9; // A4
  worksheet.pageSetup.margins = {
    left: 0.7,
    right: 0.7,
    top: 0.7,
    bottom: 0.7,
  };

  // C. Vẽ Giao Diện (Dùng tọa độ thủ công)
  let currentRow = 1;

  // 1. Header Đơn vị & Mẫu số
  // worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
  const cellA1 = worksheet.getCell(`A${currentRow}`);
  cellA1.value = "Đơn vị: Tổ Dân Phố (Demo)";
  cellA1.font = { bold: true, name: "Times New Roman", size: 11 };

  // worksheet.mergeCells(`E${currentRow}:F${currentRow}`);
  const cellE1 = worksheet.getCell(`G${currentRow}`);
  cellE1.value = "Mẫu số 06 - TT";
  cellE1.font = { bold: true, name: "Times New Roman", size: 11 };
  cellE1.alignment = { horizontal: "right" }; // Căn phải cho mẫu số

  currentRow += 2; // Cách dòng

  // 2. Tiêu đề Phiếu
  // worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
  const titleCell = worksheet.getCell(`D${currentRow}`);
  titleCell.value = "PHIẾU THU TIỀN";
  titleCell.font = { size: 16, bold: true, name: "Times New Roman" };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };

  currentRow++;

  // Ngày tháng năm
  const date = new Date(payment.createdAt || new Date());
  // worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
  const dateCell = worksheet.getCell(`D${currentRow}`);
  dateCell.value = `Ngày ${date.getDate()} tháng ${
    date.getMonth() + 1
  } năm ${date.getFullYear()}`;
  dateCell.alignment = { horizontal: "center" };
  dateCell.font = { italic: true, name: "Times New Roman", size: 11 };

  currentRow += 2; // Cách dòng

  // 3. Thông tin chi tiết
  const writeLine = (label, content, isBold = false) => {
    // Merge A-F để có chỗ viết dài
    // worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    const cell = worksheet.getCell(`A${currentRow}`);
    cell.value = `${label} ${content}`;
    cell.font = { name: "Times New Roman", size: 12, bold: isBold };
    cell.alignment = { horizontal: "left" };
    currentRow++;
  };

  writeLine(
    "Họ và tên người nộp:",
    `${payment.household.household_no} (Chủ hộ)`
  );
  writeLine("Địa chỉ:", payment.household.address);
  writeLine("Lý do nộp:", `Đóng khoản thu: ${payment.feeRate.item_type}`);

  // Số tiền (Số)
  const amountNum = parseInt(payment.paid_amount || payment.total_amount || 0);
  const formatMoney = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amountNum);
  writeLine("Số tiền:", formatMoney, true);

  // Số tiền (Chữ)
  // worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
  const textMoneyCell = worksheet.getCell(`A${currentRow}`);

  let textMoneyStr = "Không đồng";
  if (amountNum > 0) {
    try {
      // @ts-ignore
      const tempText = vnNum2Words(amountNum);
      const safeText = String(tempText)
        .replace(/[\u0000-\u001F\u007F]/g, "") // bỏ ký tự XML lỗi
        .trim();

      textMoneyStr =
        safeText.charAt(0).toUpperCase() + safeText.slice(1) + " đồng";
    } catch (e) {
      textMoneyStr = "...";
    }
  }

  textMoneyCell.value = `(Viết bằng chữ): ${textMoneyStr}`;
  textMoneyCell.font = { italic: true, name: "Times New Roman", size: 12 };

  currentRow += 3; // Cách dòng trước khi ký

  // 4. Chữ ký
  const rTitle = currentRow;
  const styleTitle = { bold: true, name: "Times New Roman", size: 11 };

  // Viết vào đúng tọa độ cột A, C, E
  worksheet.getCell(`B${rTitle}`).value = "Người nộp tiền";
  worksheet.getCell(`D${rTitle}`).value = "Người lập phiếu";
  worksheet.getCell(`F${rTitle}`).value = "Thủ quỹ";

  worksheet.getCell(`B${rTitle}`).font = styleTitle;
  worksheet.getCell(`D${rTitle}`).font = styleTitle;
  worksheet.getCell(`F${rTitle}`).font = styleTitle;

  worksheet.getCell(`B${rTitle}`).alignment = { horizontal: "center" };
  worksheet.getCell(`D${rTitle}`).alignment = { horizontal: "center" };
  worksheet.getCell(`F${rTitle}`).alignment = { horizontal: "center" };

  currentRow++;

  const rSign = currentRow;
  const styleSign = { italic: true, name: "Times New Roman", size: 10 };

  worksheet.getCell(`B${rSign}`).value = "(Ký, họ tên)";
  worksheet.getCell(`D${rSign}`).value = "(Ký, họ tên)";
  worksheet.getCell(`F${rSign}`).value = "(Ký, họ tên)";

  worksheet.getCell(`B${rSign}`).font = styleSign;
  worksheet.getCell(`D${rSign}`).font = styleSign;
  worksheet.getCell(`F${rSign}`).font = styleSign;

  worksheet.getCell(`B${rSign}`).alignment = { horizontal: "center" };
  worksheet.getCell(`D${rSign}`).alignment = { horizontal: "center" };
  worksheet.getCell(`F${rSign}`).alignment = { horizontal: "center" };

  worksheet.getColumn("A").width = 25;
  worksheet.getColumn("B").width = 2;
  worksheet.getColumn("C").width = 20;
  worksheet.getColumn("D").width = 2;
  worksheet.getColumn("E").width = 20;
  worksheet.getColumn("F").width = 5;
  worksheet.getColumn("G").width = 15;

  return await workbook.xlsx.writeBuffer();
};

export default {
  exportFeeReportToExcel,
  exportDonationReportToExcel,
  exportFullFeeReport,
  exportReceiptsForPrinting,
  exportSingleReceipt,
};
