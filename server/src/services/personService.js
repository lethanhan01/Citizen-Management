import { Op } from "sequelize";
import db from "../models/index.js";

const Person = db.Person;

const getAllNhanKhau = async ({
    page = 1,
    limit = 20,
    search,
    gender,
    minAge,
    maxAge,
    sortBy = "created_at",
    sortOrder = "DESC",
}) => {
    const offset = (page - 1) * limit;

    const whereConditions = {};

    if (search) {
        whereConditions[Op.or] = [
            { full_name: { [Op.iLike]: `%${search}%` } },
            { alias: { [Op.iLike]: `%${search}%` } },
            { citizen_id_num: { [Op.iLike]: `%${search}%` } },
        ];
    }

    if (gender) {
        whereConditions.gender = gender;
    }

    if (minAge !== undefined || maxAge !== undefined) {
        const currentYear = new Date().getFullYear();

        if (minAge !== undefined && maxAge !== undefined) {
            const maxBirthYear = currentYear - minAge;
            const minBirthYear = currentYear - maxAge;
            whereConditions.dob = {
                [Op.between]: [
                    new Date(`${minBirthYear}-01-01`),
                    new Date(`${maxBirthYear}-12-31`),
                ],
            };
        } else if (minAge !== undefined) {
            const maxBirthYear = currentYear - minAge;
            whereConditions.dob = {
                [Op.lte]: new Date(`${maxBirthYear}-12-31`),
            };
        } else if (maxAge !== undefined) {
            const minBirthYear = currentYear - maxAge;
            whereConditions.dob = {
                [Op.gte]: new Date(`${minBirthYear}-01-01`),
            };
        }
    }

    const { count, rows } = await Person.findAndCountAll({
        where: whereConditions,
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        attributes: [
            "person_id",
            "full_name",
            "alias",
            "gender",
            "dob",
            "birthplace",
            "ethnicity",
            "hometown",
            "occupation",
            "workplace",
            "citizen_id_num",
            "citizen_id_issued_date",
            "citizen_id_issued_place",
            "residency_status",
            "residence_registered_date",
            "previous_address",
            "created_at",
        ],
        include: [
            {
                model: db.HouseholdMembership,
                as: "householdMemberships",
                attributes: ["relation_to_head"],
            },
            {
                model: db.Household,
                as: "households",
                attributes: ["household_id", "household_no", "address"],
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

    const dataWithAge = rows.map((person) => {
        const personData = person.toJSON();
        if (personData.dob) {
            const birthYear = new Date(personData.dob).getFullYear();
            personData.age = new Date().getFullYear() - birthYear;
        } else {
            personData.age = null;
        }
        return personData;
    });

    return {
        data: dataWithAge,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit,
    };
};

const getNhanKhauById = async (personId) => {
    const person = await Person.findByPk(personId, {
        attributes: [
            "person_id",
            "full_name",
            "alias",
            "gender",
            "dob",
            "birthplace",
            "ethnicity",
            "hometown",
            "occupation",
            "workplace",
            "citizen_id_num",
            "citizen_id_issued_date",
            "citizen_id_issued_place",
            "residency_status",
            "residence_registered_date",
            "previous_address",
            "created_at",
        ],
        include: [
            {
                model: db.Household,
                as: "householdsAsHead",
                attributes: ["household_id", "household_no", "address"],
            },
            {
                model: db.HouseholdMembership,
                as: "householdMemberships",
                attributes: ["relation_to_head"],
            },
            {
                model: db.Household,
                as: "households",
                attributes: ["household_id", "household_no", "address"],
                through: {
                    attributes: ["start_date", "end_date", "is_head"],
                },
            },
        ],
    });

    if (!person) {
        return null;
    }

    const personData = person.toJSON();

    // Tính tuổi
    if (personData.dob) {
        const birthYear = new Date(personData.dob).getFullYear();
        personData.age = new Date().getFullYear() - birthYear;
    } else {
        personData.age = null;
    }

    return personData;
};

const updateNhanKhau = async (personId, updateData, membershipData) => {
    const person = await Person.findByPk(personId);

    if (!person) {
        return null;
    }

    await person.update(updateData);
    if (membershipData) {
        const membership = await db.HouseholdMembership.findOne({
            where: { person_id: personId },
        });
        await membership.update(membershipData);
    }

    return await getNhanKhauById(personId);
};

export default {
    getAllNhanKhau,
    getNhanKhauById,
    updateNhanKhau,
};
