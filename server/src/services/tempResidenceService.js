import { Op } from "sequelize";
import db from "../models/index.js";

const Household = db.Household;
const Person = db.Person;
const HouseholdMembership = db.HouseholdMembership;
const TempResidence = db.TempResidence;

let createTempResidence = async (data) => {
    try {
        if (!data.household_no || !data.citizen_id || !data.from_date) {
            throw new Error(
                "Thiếu thông tin bắt buộc (Mã hộ, CCCD, Ngày bắt đầu)"
            );
        }
        const check = await db.Person.findOne({
            where: { citizen_id_num: data.citizen_id },
        });
        if (check) {
            throw new Error("Công dân với CCCD này đã tồn tại trong hệ thống.");
        }
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
        if (!household) {
            throw new Error("Không tìm thấy hộ khẩu với mã số cung cấp");
        }

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
    } catch (error) {
        throw error;
    }
};

let createTempAbsence = async (data) => {
    // 1. Khởi tạo Transaction
    const t = await db.sequelize.transaction();

    try {
        // 2. Validate dữ liệu đầu vào cơ bản
        if (!data.household_no || !data.citizen_id || !data.from_date) {
            throw new Error(
                "Thiếu thông tin bắt buộc (Mã hộ, CCCD, Ngày bắt đầu)"
            );
        }

        // 3. Tìm thông tin
        const [household, person] = await Promise.all([
            Household.findOne({
                where: { household_no: data.household_no },
                transaction: t,
            }),
            Person.findOne({
                where: { citizen_id_num: data.citizen_id },
                transaction: t,
            }),
        ]);

        if (!household)
            throw new Error("Không tìm thấy hộ khẩu với mã số cung cấp");
        if (!person)
            throw new Error("Không tìm thấy công dân với CCCD cung cấp");

        // 4. Kiểm tra xem người này có đang ở trong hộ đó không
        const membership = await HouseholdMembership.findOne({
            where: {
                person_id: person.person_id,
                household_id: household.household_id,
                end_date: null,
            },
            transaction: t,
        });

        if (!membership) {
            throw new Error(
                "Công dân này hiện không phải là thành viên thường trú của hộ này."
            );
        }

        // 5. Cập nhật trạng thái Person
        await person.update(
            {
                residency_status: "temporary_absent",
            },
            { transaction: t }
        );

        // 6. Tạo bản ghi Tạm vắng
        const newTempAbsence = await TempResidence.create(
            {
                person_id: person.person_id,
                type: "TEMPORARY_ABSENCE",
                household_id: household.household_id,
                from_date: data.from_date,
                to_date: data.to_date || null,
                status: "ACTIVE",
                registered_by_person_id: data.registered_by_person_id || null,
                note: data.note || `Đăng ký tạm vắng từ ${data.from_date}`,
            },
            { transaction: t }
        );

        await t.commit();
        return newTempAbsence;
    } catch (error) {
        await t.rollback();
        throw error;
    }
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
