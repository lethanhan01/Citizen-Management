import db from "../models/index.js";

const PersonEvent = db.PersonEvent;
const Person = db.Person;
const Household = db.Household;

/**
 * Tạo sự kiện cho nhân khẩu
 */
const createPersonEvent = async (eventData) => {
    const {
        person_id,
        event_type,
        event_date,
        place_or_destination,
        old_household_id,
        new_household_id,
        created_by,
        note,
    } = eventData;

    return await PersonEvent.create({
        person_id,
        event_type,
        event_date: event_date || new Date(),
        place_or_destination,
        old_household_id,
        new_household_id,
        created_by,
        note,
    });
};

/**
 * Lấy tất cả sự kiện của một nhân khẩu
 */
const getPersonEvents = async (personId, options = {}) => {
    const { limit = 50, offset = 0, event_type } = options;

    const whereConditions = { person_id: personId };

    if (event_type) {
        whereConditions.event_type = event_type;
    }

    return await PersonEvent.findAndCountAll({
        where: whereConditions,
        limit,
        offset,
        order: [["event_date", "DESC"]],
        include: [
            {
                model: Person,
                as: "person",
                attributes: ["person_id", "full_name"],
            },
            {
                model: Household,
                as: "oldHousehold",
                attributes: ["household_id", "household_no", "address"],
            },
            {
                model: Household,
                as: "newHousehold",
                attributes: ["household_id", "household_no", "address"],
            },
        ],
    });
};

/**
 * Ghi log sự kiện sinh
 */
const logBirthEvent = async (personId, birthData, userId) => {
    return await createPersonEvent({
        person_id: personId,
        event_type: "birth",
        event_date: birthData.event_date || birthData.dob,
        place_or_destination: birthData.birthplace,
        new_household_id: birthData.household_id,
        created_by: userId,
        note: birthData.note || `Sinh tại ${birthData.birthplace || "N/A"}`,
    });
};

/**
 * Ghi log sự kiện tử vong
 */
const logDeathEvent = async (personId, deathData, userId) => {
    return await createPersonEvent({
        person_id: personId,
        event_type: "death",
        event_date: deathData.death_date,
        place_or_destination: deathData.death_place,
        old_household_id: deathData.household_id,
        created_by: userId,
        note: deathData.note || `Tử vong tại ${deathData.death_place || "N/A"}`,
    });
};

/**
 * Ghi log sự kiện chuyển hộ khẩu
 */
const logMoveEvent = async (personId, moveData, userId) => {
    return await createPersonEvent({
        person_id: personId,
        event_type: moveData.old_household_id ? "move_out" : "move_in",
        event_date: moveData.move_date || new Date(),
        place_or_destination: moveData.destination,
        old_household_id: moveData.old_household_id,
        new_household_id: moveData.new_household_id,
        created_by: userId,
        note: moveData.note,
    });
};

/**
 * Ghi log sự kiện kết hôn
 */
const logMarriageEvent = async (personId, marriageData, userId) => {
    return await createPersonEvent({
        person_id: personId,
        event_type: "marriage",
        event_date: marriageData.marriage_date,
        place_or_destination: marriageData.marriage_place,
        new_household_id: marriageData.new_household_id,
        created_by: userId,
        note:
            marriageData.note ||
            `Kết hôn tại ${marriageData.marriage_place || "N/A"}`,
    });
};

/**
 * Ghi log sự kiện ly hôn
 */
const logDivorceEvent = async (personId, divorceData, userId) => {
    return await createPersonEvent({
        person_id: personId,
        event_type: "other",
        event_date: divorceData.divorce_date,
        place_or_destination: divorceData.divorce_place,
        old_household_id: divorceData.old_household_id,
        created_by: userId,
        note: divorceData.note || "Ly hôn",
    });
};

export default {
    createPersonEvent,
    getPersonEvents,
    logBirthEvent,
    logDeathEvent,
    logMoveEvent,
    logMarriageEvent,
    logDivorceEvent,
};
