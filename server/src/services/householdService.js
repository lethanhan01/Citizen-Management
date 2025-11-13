import db from "../models/index.js";

let createHousehold = async (data) => {
    return await db.Household.create({
        household_no: data.household_no,
        address: data.address,
        head_person_id: data.head_person_id,
        note: data.note,
        household_type: data.household_type,
    });
};
let getAllHouseholds = async () => {
    return await db.Household.findAll({
        limit: 10,
    });
};
let getHouseholdById = async (id) => {
    return await db.Household.findOne({
        where: { household_id: id },
    });
};
let updateHousehold = async (id, data) => {
    return await db.Household.update(data, {
        where: { household_id: id },
    });
};
let deleteHousehold = async (id) => {
    return await db.Household.destroy({
        where: { household_id: id },
    });
};
export default {
    createHousehold,
    getAllHouseholds,
    getHouseholdById,
    updateHousehold,
    deleteHousehold,
};
