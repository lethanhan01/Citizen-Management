import express from "express";
import {
    createHousehold,
    getAllHouseholds,
    getHouseholdById,
    updateHousehold,
    deleteHousehold,
} from "../controllers/householdController.js";
import {
    getAllNhanKhau,
    getNhanKhauById,
    updateNhanKhau,
} from "../controllers/personController.js";
import pool from "../config/db.js";

const router = express.Router();
let initWebRoutes = (app) => {
    router.post("/api/v1/ho-khau", createHousehold);
    router.get("/api/v1/ho-khau/:id", getHouseholdById);
    router.get("/api/v1/ho-khau", getAllHouseholds);
    router.put("/api/v1/ho-khau/:id", updateHousehold);
    router.delete("/api/v1/ho-khau/:id", deleteHousehold);
    router.get("/api/v1/nhan-khau/:id", getNhanKhauById);
    router.get("/api/v1/nhan-khau", getAllNhanKhau);
    router.put("/api/v1/nhan-khau/:id", updateNhanKhau);
    return app.use("/", router);
};

export default initWebRoutes;
