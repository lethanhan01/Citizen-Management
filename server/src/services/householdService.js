import { Op } from "sequelize";
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
        attributes: {
            include: [
                [
                    db.Sequelize.literal(`(
                        SELECT COUNT(*) FROM core.household_membership hm
                        JOIN core.person p ON hm.person_id = p.person_id
                        WHERE hm.household_id = "Household"."household_id" AND (hm.end_date > CURRENT_DATE OR hm.end_date IS NULL)
                        AND p.residency_status NOT IN ('deceased', 'moved_out')
                    )`),
                    "members_count",
                ],
            ],
        },
        include: [
            {
                model: db.Person,
                as: "headPerson",
                attributes: ["person_id", "full_name"],
            },
        ],
        order: [["household_id", "ASC"]],
    });
};
let getHouseholdById = async (id) => {
    return await db.Household.findOne({
        where: { household_id: id },
        attributes: {
            include: [
                [
                    db.Sequelize.literal(`(
                        SELECT COUNT(*) FROM core.household_membership hm
                        JOIN core.person p ON hm.person_id = p.person_id
                        WHERE hm.household_id = "Household"."household_id" AND (hm.end_date > CURRENT_DATE OR hm.end_date IS NULL)
                        AND p.residency_status NOT IN ('deceased', 'moved_out')
                    )`),
                    "members_count",
                ],
            ],
        },
        include: [
            {
                model: db.Person,
                as: "headPerson",
                attributes: ["person_id", "full_name", "gender", "dob"],
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

let deleteById = async (id, household_id, transaction) => {
    return await db.HouseholdMembership.destroy({
        where: { person_id: id, household_id: household_id },
        transaction: transaction,
    });
};

const Household = db.Household;
const Person = db.Person;
const HouseholdMembership = db.HouseholdMembership;
const HouseholdHistory = db.HouseholdHistory;

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
            move_in: "move_in",
        };

        const eventNoteMapping = {
            birth: `Thêm nhân khẩu mới sinh: ${full_name}`,
            move_in: `Thêm nhân khẩu chuyển đến: ${full_name}`,
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
        await db.PersonEvent.create(
            {
                person_id: newPerson.person_id,
                created_by: userId,
                event_date: membershipStartDate,
                event_type: event_type,
                new_household_id: householdId,
                note: note || eventNoteMapping[event_type],
            },
            { transaction }
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

let splitHousehold = async (
    hoKhauCuId,
    thongTinHoKhauMoi,
    chuHoMoiId,
    danhSachNhanKhauTachDi
) => {
    const transaction = await db.sequelize.transaction();
    try {
        const oldHousehold = await Household.findByPk(hoKhauCuId, {
            transaction,
        });
        if (!oldHousehold) {
            throw new Error(`Không tìm thấy hộ khẩu với ID: ${hoKhauCuId}`);
        }
        const newHeadPerson = await Person.findByPk(chuHoMoiId, {
            transaction,
        });
        if (!newHeadPerson) {
            throw new Error(`Không tìm thấy nhân khẩu với ID: ${chuHoMoiId}`);
        }
        const oldMemberships = await HouseholdMembership.findAll({
            where: {
                household_id: hoKhauCuId,
                person_id: { [Op.in]: danhSachNhanKhauTachDi },
                end_date: null,
            },
            transaction,
        });
        if (oldMemberships.length !== danhSachNhanKhauTachDi.length) {
            throw new Error(
                "Một số nhân khẩu không thuộc hộ khẩu cũ hoặc đã không còn active"
            );
        }
        const totalOldMembers = await HouseholdMembership.count({
            where: {
                household_id: hoKhauCuId,
                end_date: null,
            },
            transaction,
        });
        if (totalOldMembers <= danhSachNhanKhauTachDi.length) {
            throw new Error(
                "Không thể tách hộ khẩu khi số nhân khẩu tách đi bằng hoặc nhiều hơn số nhân khẩu hiện có."
            );
        }
        const newHousehold = await Household.create(
            {
                household_no: thongTinHoKhauMoi.household_no,
                address: thongTinHoKhauMoi.address,
                head_person_id: null, // Sẽ cập nhật sau
                household_type: thongTinHoKhauMoi.household_type || "family",
                note:
                    thongTinHoKhauMoi.note ||
                    `Tách từ hộ khẩu ID: ${hoKhauCuId}`,
            },
            { transaction }
        );
        await HouseholdHistory.create(
            {
                household_id: newHousehold.household_id,
                event_type: "split_household",
                changed_by_user_id: null,
                note: `Tạo hộ khẩu mới từ việc tách hộ ${oldHousehold.household_no}`,
            },
            { transaction }
        );

        const splitDate = new Date();
        for (const personId of danhSachNhanKhauTachDi) {
            const oldMembership = await HouseholdMembership.findOne({
                where: {
                    household_id: hoKhauCuId,
                    person_id: personId,
                    end_date: null,
                },
                transaction,
            });
            await oldMembership.update(
                { end_date: splitDate },
                { transaction }
            );
            await deleteById(personId, hoKhauCuId, transaction);
            const isNewHead = String(personId) === String(chuHoMoiId);
            await HouseholdMembership.create(
                {
                    household_id: newHousehold.household_id,
                    person_id: personId,
                    start_date: splitDate,
                    is_head: isNewHead,
                    relation_to_head: isNewHead
                        ? "Chủ hộ"
                        : oldMembership.relation_to_head,
                    membership_type: oldMembership.membership_type,
                },
                { transaction }
            );
            await oldMembership.update(
                { end_date: splitDate },
                { transaction }
            );
            await newHousehold.update(
                { head_person_id: chuHoMoiId },
                { transaction }
            );
            const person = await Person.findByPk(personId, { transaction });
            await HouseholdHistory.create(
                {
                    household_id: hoKhauCuId,
                    event_type: "move_out",
                    old_value: JSON.stringify({
                        person_id: person.person_id,
                        full_name: person.full_name,
                        reason: "split_household",
                    }),
                    changed_by_user_id: null,
                    note: `${person.full_name} rời khỏi hộ do tách hộ sang ${newHousehold.household_no}`,
                },
                { transaction }
            );
            await HouseholdHistory.create(
                {
                    household_id: newHousehold.household_id,
                    event_type: "move_in",
                    new_value: JSON.stringify({
                        person_id: person.person_id,
                        full_name: person.full_name,
                        reason: "split_household",
                        is_head: isNewHead,
                    }),
                    changed_by_user_id: null,
                    note: `${person.full_name} ${
                        isNewHead ? "(Chủ hộ)" : ""
                    } gia nhập hộ do tách từ hộ ${oldHousehold.household_no}`,
                },
                { transaction }
            );
            await db.PersonEvent.create(
                {
                    person_id: personId,
                    event_type: "move_out",
                    event_date: splitDate,
                    place_or_destination: newHousehold.address,
                    old_household_id: hoKhauCuId,
                    new_household_id: newHousehold.household_id,
                    created_by: null,
                    note: `Chuyển từ hộ ${oldHousehold.household_no} sang hộ ${newHousehold.household_no} do tách hộ`,
                },
                { transaction }
            );
        }

        await HouseholdHistory.create(
            {
                household_id: hoKhauCuId,
                event_type: "split_household",
                changed_by_user_id: null,
                new_value: JSON.stringify({
                    new_household_id: newHousehold.household_id,
                    new_household_no: newHousehold.household_no,
                    members_count: danhSachNhanKhauTachDi.length,
                }),
                note: `Tách ${danhSachNhanKhauTachDi.length} nhân khẩu sang hộ mới ${newHousehold.household_no}`,
            },
            { transaction }
        );

        await transaction.commit();

        const oldHouseholdDetail = await getHouseholdById(hoKhauCuId);
        const newHouseholdDetail = await getHouseholdById(
            newHousehold.household_id
        );
        return {
            oldHousehold: oldHouseholdDetail,
            newHousehold: newHouseholdDetail,
            splitInfo: {
                splitDate,
                membersMoved: danhSachNhanKhauTachDi.length,
                new_head_person_id: chuHoMoiId,
            },
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

let getHouseholdHistory = async (householdId) => {
    return await HouseholdHistory.findAll({
        where: { household_id: householdId },
        order: [["changed_at", "DESC"]],
    });
};

let changeHouseholdHead = async (
    householdId,
    newHeadPersonId,
    relationOldHead,
    userId
) => {
    const transaction = await db.sequelize.transaction();
    try {
        const household = await Household.findByPk(householdId, {
            transaction,
        });
        if (!household) {
            throw new Error(`Không tìm thấy hộ khẩu với ID: ${householdId}`);
        }
        const newHeadPerson = await Person.findByPk(newHeadPersonId, {
            transaction,
        });
        if (!newHeadPerson) {
            throw new Error(
                `Không tìm thấy nhân khẩu với ID: ${newHeadPersonId}`
            );
        }
        const newHeadMembership = await HouseholdMembership.findOne({
            where: {
                household_id: householdId,
                person_id: newHeadPersonId,
                end_date: null,
            },
            transaction,
        });
        if (!newHeadMembership) {
            throw new Error(
                `Nhân khẩu với ID: ${newHeadPersonId} không thuộc hộ khẩu hoặc không còn active`
            );
        }
        const oldHeadPersonId = household.head_person_id;
        let oldHeadPerson = null;
        let oldHeadMembership = null;
        if (oldHeadPersonId) {
            oldHeadPerson = await Person.findByPk(oldHeadPersonId, {
                transaction,
            });
            oldHeadMembership = await HouseholdMembership.findOne({
                where: {
                    household_id: householdId,
                    person_id: oldHeadPersonId,
                    end_date: null,
                },
                transaction,
            });
        }
        const changeDate = new Date();
        await household.update(
            { head_person_id: newHeadPersonId },
            { transaction }
        );
        if (oldHeadMembership) {
            const newRelationOldHead = relationOldHead || "Thành viên gia đình";
            await oldHeadMembership.update(
                { is_head: false, relation_to_head: newRelationOldHead },
                { transaction }
            );
            await HouseholdHistory.create(
                {
                    household_id: householdId,
                    event_type: "head_change",
                    field_changed: "membership.is_head",
                    old_value: "true",
                    new_value: "false",
                    changed_by_user_id: null,
                    note: `${oldHeadPerson.full_name} không còn là chủ hộ, trở thành ${newRelationOldHead}`,
                },
                { transaction }
            );
            await db.PersonEvent.create(
                {
                    person_id: oldHeadPersonId,
                    created_by: null,
                    event_date: changeDate,
                    event_type: "head_change",
                    new_household_id: householdId,
                    note: `Thay đổi chủ hộ, ${oldHeadPerson.full_name} không còn là chủ hộ, chuyển thành ${newRelationOldHead}`,
                },
                { transaction }
            );
        }
        await newHeadMembership.update(
            { is_head: true, relation_to_head: "Chủ hộ" },
            { transaction }
        );
        await HouseholdHistory.create(
            {
                household_id: householdId,
                event_type: "head_change",
                field_changed: "household.head_person_id",
                old_value: oldHeadPersonId ? String(oldHeadPersonId) : null,
                new_value: String(newHeadPersonId),
                changed_by_user_id: null,
                note: `Thay đổi chủ hộ từ ${
                    oldHeadPerson ? oldHeadPerson.full_name : "không có"
                } sang ${newHeadPerson.full_name}`,
            },
            { transaction }
        );
        await db.PersonEvent.create(
            {
                person_id: newHeadPersonId,
                created_by: null,
                event_date: changeDate,
                event_type: "head_change",
                new_household_id: householdId,
                note: `Thay đổi chủ hộ, ${newHeadPerson.full_name} trở thành chủ hộ`,
            },
            { transaction }
        );
        await transaction.commit();
        const updatedHousehold = await getHouseholdById(householdId);
        return {
            household: updatedHousehold,
            changeInfo: {
                change_date: changeDate,
                old_head: oldHeadPerson
                    ? {
                          person_id: oldHeadPerson.person_id,
                          full_name: oldHeadPerson.full_name,
                          new_relation: relationOldHead || "Thành viên",
                      }
                    : null,
                new_head: {
                    person_id: newHeadPerson.person_id,
                    full_name: newHeadPerson.full_name,
                },
            },
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

let cleanupExpiredMemberships = async () => {
    const transaction = await db.sequelize.transaction();
    try {
        // 1. Tìm tất cả membership hết hạn
        const expiredMemberships = await HouseholdMembership.findAll({
            where: {
                end_date: {
                    [Op.lt]: db.sequelize.literal("CURRENT_DATE"),
                },
            },
            transaction,
        });

        if (expiredMemberships.length === 0) {
            await transaction.commit();
            return {
                success: true,
                message: "Không có membership hết hạn để xóa",
                deletedMembershipsCount: 0,
                deletedPersonsCount: 0,
            };
        }

        // 2. Lấy danh sách person_id từ membership hết hạn
        const personIdsToCheck = expiredMemberships.map((m) => m.person_id);

        // 3. Kiểm tra Person nào không còn membership active nào khác
        const personsToDelete = await Person.findAll({
            where: {
                person_id: {
                    [Op.in]: personIdsToCheck,
                },
            },
            include: [
                {
                    model: HouseholdMembership,
                    as: "householdMemberships",
                    where: {
                        end_date: {
                            [Op.gt]: db.sequelize.literal("CURRENT_DATE"),
                        },
                    },
                    required: false,
                },
            ],
            transaction,
        });

        const personIdsToRemove = personsToDelete
            .filter(
                (p) =>
                    !p.householdMemberships ||
                    p.householdMemberships.length === 0
            )
            .map((p) => p.person_id);

        // 4. Xóa HouseholdMembership hết hạn
        const deletedMembershipsCount = await HouseholdMembership.destroy({
            where: {
                end_date: {
                    [Op.lt]: db.sequelize.literal("CURRENT_DATE"),
                },
            },
            transaction,
        });

        // 5. Xóa Person nếu không còn membership active nào
        let deletedPersonsCount = 0;
        if (personIdsToRemove.length > 0) {
            deletedPersonsCount = await Person.destroy({
                where: {
                    person_id: {
                        [Op.in]: personIdsToRemove,
                    },
                },
                transaction,
            });
        }

        await transaction.commit();

        return {
            success: true,
            message: `Đã xóa ${deletedMembershipsCount} membership hết hạn và ${deletedPersonsCount} Person`,
            deletedMembershipsCount,
            deletedPersonsCount,
        };
    } catch (error) {
        await transaction.rollback();
        throw new Error(`Lỗi khi xóa membership hết hạn: ${error.message}`);
    }
};

export default {
    createHousehold,
    getAllHouseholds,
    getHouseholdById,
    updateHousehold,
    deleteHousehold,
    addPersonToHousehold,
    splitHousehold,
    getHouseholdHistory,
    changeHouseholdHead,
    cleanupExpiredMemberships,
};
