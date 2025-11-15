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
let getAllHouseholds = async ({ page = 1, limit = 20 }) => {
    const offset = (page - 1) * limit;
    return await db.Household.findAll({
        offset,
        limit,
    });
};
let getHouseholdById = async (id) => {
    return await db.Household.findOne({
        where: { household_id: id },
        include: [
            {
                model: db.Person,
                as: "headPerson",
            },
            {
                model: db.Person,
                as: "residents",
                through: {
                    attributes: [
                        "start_date",
                        "end_date",
                        "relation_to_head",
                        "is_head",
                    ],
                },
            },
        ],
    });
};
let updateHousehold = async (id, data) => {
    return await db.Household.update(data, {
        where: { household_id: id },
    });
};
let deleteHousehold = async (id) => {
    const members = await db.HouseholdMembership.findAll({
        where: { household_id: id },
    });
    if (members.length > 0) {
        throw new Error("Không thể xóa hộ khẩu có thành viên sinh sống.");
    } else {
        return await db.Household.destroy({
            where: { household_id: id },
        });
    }
};
export default {
    createHousehold,
    getAllHouseholds,
    getHouseholdById,
    updateHousehold,
    deleteHousehold,
};
