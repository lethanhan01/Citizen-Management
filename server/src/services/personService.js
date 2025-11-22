import { Op } from "sequelize";
import db from "../models/index.js";
import personEventService from "./personEventService.js";

// ✅ Import đầy đủ các models
const Person = db.Person;
const Household = db.Household;
const HouseholdMembership = db.HouseholdMembership; // ✅ PHẢI CÓ DÒNG NÀY
const HouseholdHistory = db.HouseholdHistory; // ✅ THÊM DÒNG NÀY
const PersonEvent = db.PersonEvent;

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
                model: HouseholdMembership,
                as: "householdMemberships",
                attributes: ["relation_to_head"],
            },
            {
                model: Household,
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
                model: Household,
                as: "householdsAsHead",
                attributes: ["household_id", "household_no", "address"],
            },
            {
                model: HouseholdMembership,
                as: "householdMemberships",
                attributes: ["relation_to_head"],
            },
            {
                model: Household,
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

/**
 * Cập nhật thông tin nhân khẩu và tự động ghi log lịch sử
 */
const updateNhanKhau = async (personId, personData, membershipData, userId) => {
    // Tìm person
    const person = await Person.findByPk(personId);

    if (!person) {
        return null;
    }

    // Lấy giá trị cũ trước khi cập nhật
    const oldValues = person.toJSON();

    // Bắt đầu transaction
    const transaction = await db.sequelize.transaction();

    try {
        // 1. Cập nhật thông tin person
        if (personData && Object.keys(personData).length > 0) {
            await person.update(personData, { transaction });

            // Ghi log cho TỪNG trường thay đổi
            for (const [field, newValue] of Object.entries(personData)) {
                if (oldValues[field] !== newValue) {
                    // Lấy household_id để ghi log (lấy hộ đang active)
                    const activeMembership = await HouseholdMembership.findOne({
                        where: {
                            person_id: personId,
                            end_date: null,
                        },
                        transaction,
                    });

                    if (activeMembership) {
                        // Mapping tên trường sang tiếng Việt
                        const fieldNameMapping = {
                            full_name: "Họ và tên",
                            alias: "Bí danh",
                            gender: "Giới tính",
                            dob: "Ngày sinh",
                            birthplace: "Nơi sinh",
                            ethnicity: "Dân tộc",
                            hometown: "Quê quán",
                            occupation: "Nghề nghiệp",
                            workplace: "Nơi làm việc",
                            citizen_id_num: "Số CCCD",
                            citizen_id_issued_date: "Ngày cấp CCCD",
                            citizen_id_issued_place: "Nơi cấp CCCD",
                            residency_status: "Trạng thái cư trú",
                            residence_registered_date:
                                "Ngày đăng ký thường trú",
                            previous_address: "Địa chỉ trước đó",
                        };

                        const fieldNameVN = fieldNameMapping[field] || field;

                        // Ghi log vào household_history
                        await HouseholdHistory.create(
                            {
                                household_id: activeMembership.household_id,
                                event_type: "other",
                                field_changed: `person.${field}`,
                                old_value: oldValues[field]
                                    ? String(oldValues[field])
                                    : null,
                                new_value: newValue ? String(newValue) : null,
                                changed_by_user_id: userId || null,
                                note: `Cập nhật ${fieldNameVN} của ${
                                    oldValues.full_name
                                } từ "${oldValues[field] || "trống"}" thành "${
                                    newValue || "trống"
                                }"`,
                            },
                            { transaction }
                        );
                    }
                }
            }
            await PersonEvent.create(
                {
                    person_id: personId,
                    created_by: userId || null,
                    event_date: new Date(),
                    event_type: "other",
                    place_or_destination: "Cập nhật thông tin nhân khẩu",
                    old_household_id: null,
                    new_household_id: null,
                    note: `Cập nhật thông tin nhân khẩu ${oldValues.full_name}`,
                },
                { transaction }
            );
        }

        // 2. Cập nhật membership (nếu có)
        if (membershipData) {
            const membership = await HouseholdMembership.findOne({
                where: {
                    person_id: personId,
                    end_date: null, // Chỉ lấy membership active
                },
                transaction,
            });

            if (membership) {
                // Lưu giá trị cũ của membership
                const oldMembershipValues = membership.toJSON();

                // Cập nhật membership
                await membership.update(membershipData, { transaction });

                // Ghi log cho membership changes
                if (membershipData.relation_to_head !== undefined) {
                    await HouseholdHistory.create(
                        {
                            household_id: membership.household_id,
                            event_type: "other",
                            field_changed: "membership.relation_to_head",
                            old_value: oldMembershipValues.relation_to_head,
                            new_value: membershipData.relation_to_head,
                            changed_by_user_id: userId || null,
                            note: `Thay đổi quan hệ với chủ hộ của ${oldValues.full_name} từ "${oldMembershipValues.relation_to_head}" thành "${membershipData.relation_to_head}"`,
                        },
                        { transaction }
                    );
                }
            }
        }

        // Commit transaction
        await transaction.commit();

        // Lấy lại thông tin sau khi cập nhật
        return await getNhanKhauById(personId);
    } catch (error) {
        // Rollback nếu có lỗi
        await transaction.rollback();
        throw error;
    }
};

let getPersonEvents = async (personId) => {
    return await PersonEvent.findAll({
        where: { person_id: personId },
        order: [["event_date", "DESC"]],
    });
};

export default {
    getAllNhanKhau,
    getNhanKhauById,
    updateNhanKhau,
    getPersonEvents,
};
