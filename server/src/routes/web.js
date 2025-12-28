import express from "express";
import {
  createHousehold,
  getAllHouseholds,
  getHouseholdById,
  updateHousehold,
  deleteHousehold,
  addPersonToHousehold,
  splitHousehold,
  getHouseholdHistory,
  changeHouseholdHead,
} from "../controllers/householdController.js";
import {
  getAllNhanKhau,
  getNhanKhauById,
  updateNhanKhau,
  getPersonEvents,
  handlePersonEvent,
  getPersonDetail,
} from "../controllers/personController.js";
import {
  createTempResidence,
  createTempAbsence,
  getTempResidence,
  updateTempResidence,
  deleteTempResidence,
} from "../controllers/tempResidenceController.js";
// --- AUTH CONTROLLER ---
import authController from "../controllers/authController.js";
// --- USER CONTROLLER ---
import userController from "../controllers/userController.js";
// --- SEARCH CONTROLLER ---
import searchController from "../controllers/searchController.js";
// --- FEE CONTROLLER ---
import feeController from "../controllers/feeController.js";
// --- CAMPAIGN CONTROLLER ---
import campaignController from "../controllers/campaignController.js";
// --- STATISTIC CONTROLLER ---
import statisticController from "../controllers/statisticController.js";
// --- EXPORT CONTROLLER ---
import exportController from "../controllers/exportController.js";

// --- CHECK TOKEN ---
import verifyToken from "../middleware/authMiddleware.js";
// --- CHECK ROLE ---
import checkRole from "../middleware/roleMiddleware.js";

import pool from "../config/db.js";
import { create } from "domain";

const router = express.Router();
let initWebRoutes = (app) => {
  // ---- AUTH ROUTE ---- (Admin)
  // POST: Tạo 1 tài khoản Admin mới (Cái này cực kỳ nguy hiểm => Tạo ra để Group test => Cần xóa đi khi hoàn thiện project)
  router.post("/api/v1/auth/register", authController.handleRegister);
  // POST: Login cho tất cả các User
  router.post("/api/v1/auth/login", authController.handleLogin);
  // GET: Lấy thông tin của cá nhân User đã đăng nhập
  router.get("/api/v1/auth/me", verifyToken, authController.getMe);

  // ---- USER ROUTE ---- (Admin)
  // GET: Danh sách Users (RESTful)
  router.get(
    "/api/v1/users",
    verifyToken,
    checkRole(["admin"]),
    userController.handleGetAllUsers
  );
  // POST: Tạo User (RESTful)
  router.post(
    "/api/v1/users",
    verifyToken,
    checkRole(["admin"]),
    userController.handleCreateUser
  );
  // PUT: Cập nhật User (RESTful)
  router.put(
    "/api/v1/users/:id",
    verifyToken,
    checkRole(["admin"]),
    userController.handleUpdateUser
  );
  // DELETE: Xóa User (RESTful)
  router.delete(
    "/api/v1/users/:id",
    verifyToken,
    checkRole(["admin"]),
    userController.handleDeleteUser
  );

  // Backward-compat (tạm thời): giữ các endpoint cũ để không vỡ FE cũ
  router.get(
    "/api/v1/get-all-users",
    verifyToken,
    checkRole(["admin"]),
    userController.handleGetAllUsers
  );
  router.post(
    "/api/v1/create-user",
    verifyToken,
    checkRole(["admin"]),
    userController.handleCreateUser
  );
  router.put(
    "/api/v1/update-user/:id",
    verifyToken,
    checkRole(["admin"]),
    userController.handleUpdateUser
  );
  router.delete(
    "/api/v1/delete-user/:id",
    verifyToken,
    checkRole(["admin"]),
    userController.handleDeleteUser
  );

  // ---- Update & Logout ---
  // PUT: Cá nhân User update (full_name || password) => Không khuyến khích, nên để Admin quản lý tất cả
  router.put(
    "/api/v1/auth/updateProfile",
    verifyToken,
    authController.handleUpdateProfile
  );
  // POST: Logout cho tất cả Users
  router.post("/api/v1/auth/logout", verifyToken, authController.handleLogout);

  router.post(
    "/api/v1/ho-khau",
    verifyToken,
    checkRole(["admin"]),
    createHousehold
  );
  router.get(
    "/api/v1/ho-khau/:id",
    verifyToken,
    checkRole(["admin"]),
    getHouseholdById
  );
  router.post("/api/v1/ho-khau/:hoKhauId/nhan-khau", addPersonToHousehold);
  router.get(
    "/api/v1/ho-khau",
    verifyToken,
    checkRole(["admin"]),
    getAllHouseholds
  );
  router.put(
    "/api/v1/ho-khau/:id",
    verifyToken,
    checkRole(["admin"]),
    updateHousehold
  );
  router.delete(
    "/api/v1/ho-khau/:id",
    verifyToken,
    checkRole(["admin"]),
    deleteHousehold
  );
  router.get(
    "/api/v1/ho-khau/:id/lich-su",
    verifyToken,
    checkRole(["admin"]),
    getHouseholdHistory
  );
  router.put(
    "/api/v1/ho-khau/:hoKhauId/thay-doi-chu-ho",
    verifyToken,
    checkRole(["admin"]),
    changeHouseholdHead
  );

  router.get(
    "/api/v1/nhan-khau/:id",
    verifyToken,
    checkRole(["admin"]),
    getNhanKhauById
  );
  router.get(
    "/api/v1/nhan-khau",
    verifyToken,
    checkRole(["admin"]),

    getAllNhanKhau
  );
  router.put(
    "/api/v1/nhan-khau/:id",
    verifyToken,
    checkRole(["admin"]),
    updateNhanKhau
  );
  router.post(
    "/api/v1/ho-khau/tach-khau",
    verifyToken,
    checkRole(["admin"]),
    splitHousehold
  );
  router.get(
    "/api/v1/nhan-khau/:id/lich-su",
    verifyToken,
    checkRole(["admin"]),
    getPersonEvents
  );
  router.put(
    "/api/v1/nhan-khau/:nhanKhauId/bien-dong",
    verifyToken,
    checkRole(["admin"]),
    handlePersonEvent
  );

  // Lấy thông tin của công dân
  router.get(
    "/api/v1/nhan-khau/thong-tin/:id",
    verifyToken,
    checkRole(["admin"]),
    getPersonDetail
  );

  // QUẢN LÝ KHOẢN THU (Admin/Accountant)
  router.post(
    "/api/v1/khoan-thu",
    verifyToken,
    checkRole(["admin", "accountant"]),
    feeController.handleCreateFee
  );
  router.get(
    "/api/v1/khoan-thu/danh-sach",
    verifyToken,
    checkRole(["admin", "accountant"]),
    feeController.handleGetAllFees
  );
  // Xóa khoản thu (Dùng để xóa rác khi test API)
  router.delete(
    "/api/v1/khoan-thu/:id",
    verifyToken,
    checkRole(["admin", "accountant"]),
    feeController.handleDeleteFee
  );
  // API Tìm kiếm/Lọc danh sách đóng tiền
  router.get(
    "/api/v1/khoan-thu/tim-kiem",
    verifyToken,
    checkRole(["admin", "accountant"]),
    feeController.handleGetPayments
  );
  // POST: GHI NHẬN NỘP TIỀN
  router.post(
    "/api/v1/khoan-thu/xac-nhan",
    verifyToken,
    checkRole(["admin", "accountant"]),
    feeController.handleConfirmPayment
  );

  // --- Tìm kiếm linh hoạt ---
  // GET: Admin hay Accountant đều dùng được
  router.get(
    "/api/v1/search",
    verifyToken,
    checkRole(["admin", "accountant"]),
    searchController.handleSearch
  );

  // Quản lý tạm trú tạm vắng
  router.post(
    "/api/v1/tam-tru",
    verifyToken,
    checkRole(["admin"]),
    createTempResidence
  );

  router.post(
    "/api/v1/tam-vang",
    verifyToken,
    checkRole(["admin"]),
    createTempAbsence
  );

  router.get(
    "/api/v1/tam-tru-vang",
    verifyToken,
    checkRole(["admin"]),
    getTempResidence
  );

  router.put(
    "/api/v1/tam-tru-vang/:id",
    verifyToken,
    checkRole(["admin"]),
    updateTempResidence
  );

  router.delete(
    "/api/v1/tam-tru-vang/:id",
    verifyToken,
    checkRole(["admin"]),
    deleteTempResidence
  );

  //CRUD CHIẾN DỊCH TỰ NGUYỆN
  // Tạo mới
  router.post(
    "/api/v1/chien-dich",
    verifyToken,
    checkRole(["admin", "accountant"]),
    campaignController.handleCreate
  );
  // Xem danh sách
  router.get(
    "/api/v1/chien-dich",
    verifyToken,
    checkRole(["admin", "accountant"]),
    campaignController.handleIndex
  );
  // Xem chi tiết
  router.get(
    "/api/v1/chien-dich/:id",
    verifyToken,
    checkRole(["admin", "accountant"]),
    campaignController.handleShow
  );
  // Cập nhật
  router.put(
    "/api/v1/chien-dich/:id",
    verifyToken,
    checkRole(["admin", "accountant"]),
    campaignController.handleUpdate
  );
  // Xóa
  router.delete(
    "/api/v1/chien-dich/:id",
    verifyToken,
    checkRole(["admin", "accountant"]),
    campaignController.handleDelete
  );
  // GHI NHẬN ĐÓNG GÓP TỰ NGUYỆN
  router.post(
    "/api/v1/chien-dich/dong-gop",
    verifyToken,
    checkRole(["admin", "accountant"]),
    campaignController.handleContribute
  );

  //GET: Thống kê Dashboard
  router.get(
    "/api/v1/so-lieu/tong-quan",
    verifyToken,
    checkRole(["admin"]),
    statisticController.getDashboard
  );

  // GET: Báo cáo thu phí (Chi tiết theo từng khoản)
  router.get(
    "/api/v1/so-lieu/thu-phi/:id",
    verifyToken,
    checkRole(["admin", "accountant"]),
    statisticController.getFeeReport
  );

  // GET: Báo cáo đóng góp tự nguyện
  router.get(
    "/api/v1/so-lieu/dong-gop/:id",
    verifyToken,
    checkRole(["admin", "accountant"]),
    statisticController.getDonationReport
  );

  // XUẤT BÁO CÁO EXCEL
  // 1. Xuất báo cáo thu phí (Danh sách hộ đang nợ hoặc chưa đóng)
  router.get(
    "/api/v1/export/thu-phi/ton-dong/:id",
    verifyToken,
    checkRole(["admin", "accountant"]),
    exportController.exportFeeReport
  );

  // 2. Xuất báo cáo đóng góp tự nguyện
  router.get(
    "/api/v1/export/dong-gop/:id",
    verifyToken,
    checkRole(["admin", "accountant"]),
    exportController.exportDonationReport
  );

  // 3. Xuất danh sách tổng hợp (để báo cáo, lưu trữ)
  router.get(
    "/api/v1/export/thu-phi/tong-hop/:id",
    verifyToken,
    checkRole(["admin", "accountant"]),
    exportController.exportFullFeeReport
  );

  // 4. Xuất phiếu thu hàng loạt (để in ra giấy đi thu tiền)
  router.get(
    "/api/v1/export/thu-phi/phieu-thu/:id",
    verifyToken,
    checkRole(["admin", "accountant"]),
    exportController.exportReceipts
  );

  // 5. In hóa đơn cho hộ đã đóng (riêng lẻ)
  router.get(
    "/api/v1/export/thu-phi/hoa-don/:paymentId",
    verifyToken,
    checkRole(["admin", "accountant"]),
    exportController.exportOneReceipt
  );

  return app.use("/", router);
};

export default initWebRoutes;
