import { Op } from "sequelize";
import db from "../models/index.js";

let createTempResidence = async (data) => {
    return await db.TempResidence.create({
        person_id: data.person_id,
        type: data.type,
        household_id: data.household_id,
        from_date: data.from_date,
        to_date: data.to_date,
        status: data.status || "ACTIVE",
        registered_by_person_id: data.registered_by_person_id || null,
        note: data.note || null,
    });
};

let getTempResidence = async (householdId, type, to_date) => {
    let whereClause = {
        household_id: householdId || { [Op.ne]: null },
    };
    if (type) {
        whereClause.type = type;
    }
    if (to_date) {
        whereClause.to_date = {
            [Op.lte]: to_date,
        };
    }
    return await db.TempResidence.findAll({
        where: whereClause,
        include: [
            {
                model: db.Person,
                as: "person",
            },
            {
                model: db.Household,
                as: "household",
            },
        ],
    });
};

let updateTempResidence = async (id, updateData) => {
    const tempResidence = await db.TempResidence.findByPk(id);
    if (!tempResidence) {
        throw new Error("TempResidence not found");
    }

    await tempResidence.update(updateData);
    return tempResidence;
};

let deleteTempResidence = async (id) => {
    const tempResidence = await db.TempResidence.findByPk(id);
    if (!tempResidence) {
        throw new Error("TempResidence not found");
    }
    await tempResidence.destroy();
    return;
};
export default {
    createTempResidence,
    getTempResidence,
    updateTempResidence,
    deleteTempResidence,
};
