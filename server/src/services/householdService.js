import db from "../models/index.js";
import householdHistoryService from "./householdHistoryService.js";

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

const Household = db.Household;
const Person = db.Person;
const HouseholdMembership = db.HouseholdMembership;

let addPersonToHousehold = async (
    householdId,
    event_type,
    personData,
    userId
) => {
    const household = await Household.findByPk(householdId);

    if (!household) {
        throw new Error(`Không tìm thấy hộ khẩu với ID: ${householdId}`);
    }

    // Bắt đầu transaction
    const transaction = await db.sequelize.transaction();

    try {
        // 1. Tạo Person mới
        const {
            // Thông tin cơ bản
            full_name,
            alias,
            gender,
            dob,
            birthplace,
            ethnicity,
            hometown,
            occupation,
            workplace,

            // Thông tin CCCD
            citizen_id_num,
            citizen_id_issued_date,
            citizen_id_issued_place,

            // Thông tin cư trú
            residency_status = "permanent",
            residence_registered_date,
            previous_address,

            // Thông tin membership
            relation_to_head,
            is_head = false,
            membership_type = "family_member",
            start_date,

            // Loại biến động

            note,
        } = personData;

        // Kiểm tra CCCD trùng (nếu có)
        if (citizen_id_num) {
            const existingPerson = await Person.findOne({
                where: { citizen_id_num },
                transaction,
            });

            if (existingPerson) {
                await transaction.rollback();
                throw new Error(
                    `Số CCCD ${citizen_id_num} đã tồn tại trong hệ thống`
                );
            }
        }

        // Tạo person mới
        const newPerson = await Person.create(
            {
                full_name,
                alias,
                gender,
                dob,
                birthplace,
                ethnicity,
                hometown,
                occupation,
                workplace,
                citizen_id_num,
                citizen_id_issued_date,
                citizen_id_issued_place,
                residency_status,
                residence_registered_date,
                previous_address,
            },
            { transaction }
        );

        // 2. Kiểm tra nếu là chủ hộ
        if (is_head) {
            // Kiểm tra xem đã có chủ hộ chưa
            const existingHead = await HouseholdMembership.findOne({
                where: {
                    household_id: householdId,
                    is_head: true,
                    end_date: null,
                },
                transaction,
            });

            if (existingHead) {
                await transaction.rollback();
                throw new Error(
                    "Hộ khẩu đã có chủ hộ. Vui lòng sử dụng API thay đổi chủ hộ."
                );
            }

            // Cập nhật head_person_id trong household
            await household.update(
                { head_person_id: newPerson.person_id },
                { transaction }
            );
        }

        // 3. Tạo HouseholdMembership
        const membershipStartDate = start_date || new Date();

        await HouseholdMembership.create(
            {
                household_id: householdId,
                person_id: newPerson.person_id,
                start_date: membershipStartDate,
                relation_to_head: is_head ? "Chủ hộ" : relation_to_head,
                is_head,
                membership_type,
            },
            { transaction }
        );

        // 4. Ghi log lịch sử biến động
        const eventTypeMapping = {
            birth: "birth",
            moved_in: "moved_in",
        };

        const eventNoteMapping = {
            birth: `Thêm nhân khẩu mới sinh: ${full_name}`,
            moved_in: `Thêm nhân khẩu chuyển đến: ${full_name}`,
        };

        await householdHistoryService.logMemberAdded(
            householdId,
            eventTypeMapping[event_type],
            {
                person_id: newPerson.person_id,
                full_name: newPerson.full_name,
                relation_to_head: is_head ? "Chủ hộ" : relation_to_head,
            },
            userId,
            note || eventNoteMapping[event_type]
        );

        // Commit transaction
        await transaction.commit();

        // 5. Lấy thông tin đầy đủ của person vừa tạo
        const personWithDetails = await Person.findByPk(newPerson.person_id, {
            include: [
                {
                    model: HouseholdMembership,
                    as: "householdMemberships",
                    where: { household_id: householdId },
                    include: [
                        {
                            model: Household,
                            as: "household",
                            attributes: [
                                "household_id",
                                "household_no",
                                "address",
                                "household_type",
                            ],
                            include: [
                                {
                                    model: Person,
                                    as: "headPerson",
                                    attributes: ["person_id", "full_name"],
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        return {
            person: personWithDetails,
            household: await Household.findByPk(householdId, {
                include: [
                    {
                        model: Person,
                        as: "headPerson",
                        attributes: ["person_id", "full_name"],
                    },
                    {
                        model: HouseholdMembership,
                        as: "members",
                        where: { end_date: null },
                        required: false,
                        include: [
                            {
                                model: Person,
                                as: "person",
                                attributes: [
                                    "person_id",
                                    "full_name",
                                    "gender",
                                    "dob",
                                ],
                            },
                        ],
                    },
                ],
            }),
        };
    } catch (error) {
        // Rollback nếu có lỗi
        await transaction.rollback();
        throw error;
    }
};

export default {
    createHousehold,
    getAllHouseholds,
    getHouseholdById,
    updateHousehold,
    deleteHousehold,
    addPersonToHousehold,
};
