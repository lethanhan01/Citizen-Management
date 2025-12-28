import { Op } from "sequelize";
import db from "../models/index.js";

let createTempResidence = async (data) => {
    const person = await db.Person.create({
        full_name: data.full_name,
        residency_status: "temporary_resident",
        gender: data.gender,
        dob: data.dob,
        citizen_id_num: data.citizen_id,
    });

    const household = await db.Household.findOne({
        where: { household_no: data.household_no },
    });

    await db.HouseholdMembership.create({
        person_id: person.person_id,
        household_id: household.household_id,
        is_head: false,
        relation_to_head: data.relation_to_head || "Tạm trú",
        membership_type: data.membership_type || "family_member",
        start_date: data.from_date,
        end_date: data.to_date || null,
    });

    return await db.TempResidence.create({
        person_id: person.person_id,
        type: "TEMPORARY_STAY",
        household_id: household.household_id,
        from_date: data.from_date,
        to_date: data.to_date,
        status: data.status || "ACTIVE",
        registered_by_person_id: data.registered_by_person_id || null,
        note: data.note || null,
    });
};

let createTempAbsence = async (data) => {
    const household = await db.Household.findOne({
        where: { household_no: data.household_no },
    });
    const person = await db.Person.findOne({
        where: { citizen_id_num: data.citizen_id },
    });
    const membership = await db.HouseholdMembership.findOne({
        where: {
            person_id: person.person_id,
            household_id: household.household_id,
        },
    });
    if (membership) {
        await membership.update({
            end_date: data.from_date,
        });
    } else {
        throw new Error("Person is not a member of the specified household");
    }
    await person.update({
        residency_status: "temporary_absent",
    });
    return await db.TempResidence.create({
        person_id: person.person_id,
        type: "TEMPORARY_ABSENCE",
        household_id: household.household_id,
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
    createTempAbsence,
    getTempResidence,
    updateTempResidence,
    deleteTempResidence,
};
