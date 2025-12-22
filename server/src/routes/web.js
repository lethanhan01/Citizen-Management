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
} from "../controllers/personController.js";

const router = express.Router();
let initWebRoutes = (app) => {
    router.post("/api/v1/ho-khau", createHousehold);
    router.get("/api/v1/ho-khau/:id", getHouseholdById);
    router.post("/api/v1/ho-khau/:hoKhauId/nhan-khau", addPersonToHousehold);
    router.get("/api/v1/ho-khau", getAllHouseholds);
    router.put("/api/v1/ho-khau/:id", updateHousehold);
    router.delete("/api/v1/ho-khau/:id", deleteHousehold);
    router.get("/api/v1/ho-khau/:id/lich-su", getHouseholdHistory);
    router.put(
        "/api/v1/ho-khau/:hoKhauId/thay-doi-chu-ho",
        changeHouseholdHead
    );

    router.get("/api/v1/nhan-khau/:id", getNhanKhauById);
    router.get("/api/v1/nhan-khau", getAllNhanKhau);
    router.put("/api/v1/nhan-khau/:id", updateNhanKhau);
    router.post("/api/v1/ho-khau/tach-khau", splitHousehold);
    router.get("/api/v1/nhan-khau/:id/lich-su", getPersonEvents);
    router.put("/api/v1/nhan-khau/:nhanKhauId/bien-dong", handlePersonEvent);
    return app.use("/", router);
};

export default initWebRoutes;
