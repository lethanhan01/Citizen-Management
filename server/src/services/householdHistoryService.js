import db from "../models/index.js";

const HouseholdHistory = db.HouseholdHistory;

/**
 * Tạo log lịch sử cho household
 */
const createHistoryLog = async (historyData) => {
    const {
        household_id,
        event_type,
        field_changed,
        old_value,
        new_value,
        changed_by_user_id,
        note,
    } = historyData;

    return await HouseholdHistory.create({
        household_id,
        event_type,
        field_changed: field_changed || null,
        old_value: old_value ? JSON.stringify(old_value) : null,
        new_value: new_value ? JSON.stringify(new_value) : null,
        changed_at: new Date(),
        changed_by_user_id: changed_by_user_id || null,
        note: note || null,
    });
};

/**
 * Lấy lịch sử của một household
 */
const getHouseholdHistory = async (householdId, options = {}) => {
    const { limit = 50, offset = 0, event_type } = options;

    const whereConditions = { household_id: householdId };

    if (event_type) {
        whereConditions.event_type = event_type;
    }

    return await HouseholdHistory.findAndCountAll({
        where: whereConditions,
        limit,
        offset,
        order: [["changed_at", "DESC"]],
        // include: [
        //     {
        //         model: db.User,
        //         as: "changedByUser",
        //         attributes: ["user_id", "username", "full_name"],
        //     },
        // ],
    });
};

/**
 * Log khi tạo household mới
 */
const logHouseholdCreated = async (household_id, userId, note) => {
    return await createHistoryLog({
        household_id,
        event_type: "created",
        note: note || "Tạo hộ khẩu mới",
        changed_by_user_id: userId,
    });
};

/**
 * Log khi cập nhật thông tin household
 */
const logHouseholdUpdated = async (
    household_id,
    field_changed,
    old_value,
    new_value,
    userId,
    note
) => {
    return await createHistoryLog({
        household_id,
        event_type: "updated",
        field_changed,
        old_value,
        new_value,
        note: note || `Cập nhật ${field_changed}`,
        changed_by_user_id: userId,
    });
};

/**
 * Log khi thêm thành viên
 */
const logMemberAdded = async (
    household_id,
    event_type,
    personInfo,
    userId,
    note
) => {
    return await createHistoryLog({
        household_id,
        event_type,
        new_value: personInfo,
        note: note || "Thêm thành viên mới",
        changed_by_user_id: userId,
    });
};

/**
 * Log khi xóa thành viên
 */
const logMemberRemoved = async (household_id, personInfo, userId, note) => {
    return await createHistoryLog({
        household_id,
        event_type: "member_removed",
        old_value: personInfo,
        note: note || "Xóa thành viên",
        changed_by_user_id: userId,
    });
};

/**
 * Log khi thay đổi chủ hộ
 */
const logHeadChanged = async (household_id, oldHead, newHead, userId, note) => {
    return await createHistoryLog({
        household_id,
        event_type: "head_changed",
        field_changed: "head_person_id",
        old_value: oldHead,
        new_value: newHead,
        note: note || "Thay đổi chủ hộ",
        changed_by_user_id: userId,
    });
};

/**
 * Log khi thay đổi địa chỉ
 */
const logAddressChanged = async (
    household_id,
    oldAddress,
    newAddress,
    userId,
    note
) => {
    return await createHistoryLog({
        household_id,
        event_type: "address_changed",
        field_changed: "address",
        old_value: oldAddress,
        new_value: newAddress,
        note: note || "Thay đổi địa chỉ",
        changed_by_user_id: userId,
    });
};

export default {
    createHistoryLog,
    getHouseholdHistory,
    logHouseholdCreated,
    logHouseholdUpdated,
    logMemberAdded,
    logMemberRemoved,
    logHeadChanged,
    logAddressChanged,
};
