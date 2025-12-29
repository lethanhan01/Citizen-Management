import { Op } from "sequelize";
import db from "../models/index.js";
import personEventService from "./personEventService.js";

const Person = db.Person;
const Household = db.Household;
const HouseholdMembership = db.HouseholdMembership;
const HouseholdHistory = db.HouseholdHistory;
const PersonEvent = db.PersonEvent;
const TempResidence = db.TempResidence;

// const getAllNhanKhau = async ({
//   page = 1,
//   limit = 20,
//   search,
//   gender,
//   residency_status,
//   minAge,
//   maxAge,
//   sortBy = "created_at",
//   sortOrder = "DESC",
// }) => {
//   const offset = (page - 1) * limit;

//   const whereConditions = {};

//   if (search) {
//     whereConditions[Op.or] = [
//       { full_name: { [Op.iLike]: `%${search}%` } },
//       { alias: { [Op.iLike]: `%${search}%` } },
//       { citizen_id_num: { [Op.iLike]: `%${search}%` } },
//     ];
//   }

//   if (gender) {
//     whereConditions.gender = gender;
//   }
//   if (residency_status) {
//     whereConditions.residency_status = residency_status;
//   }

//   if (minAge !== undefined || maxAge !== undefined) {
//     const currentYear = new Date().getFullYear();

//     if (minAge !== undefined && maxAge !== undefined) {
//       const maxBirthYear = currentYear - minAge;
//       const minBirthYear = currentYear - maxAge;
//       whereConditions.dob = {
//         [Op.between]: [
//           new Date(`${minBirthYear}-01-01`),
//           new Date(`${maxBirthYear}-12-31`),
//         ],
//       };
//     } else if (minAge !== undefined) {
//       const maxBirthYear = currentYear - minAge;
//       whereConditions.dob = {
//         [Op.lte]: new Date(`${maxBirthYear}-12-31`),
//       };
//     } else if (maxAge !== undefined) {
//       const minBirthYear = currentYear - maxAge;
//       whereConditions.dob = {
//         [Op.gte]: new Date(`${minBirthYear}-01-01`),
//       };
//     }
//   }

//   const { count, rows } = await Person.findAndCountAll({
//     where: whereConditions,
//     limit,
//     offset,
//     order: [[sortBy, sortOrder]],
//     attributes: [
//       "person_id",
//       "full_name",
//       "alias",
//       "gender",
//       "residency_status",
//       "dob",
//       "birthplace",
//       "ethnicity",
//       "hometown",
//       "occupation",
//       "workplace",
//       "citizen_id_num",
//       "citizen_id_issued_date",
//       "citizen_id_issued_place",
//       "residency_status",
//       "residence_registered_date",
//       "previous_address",
//       "created_at",
//     ],
//     include: [
//       {
//         model: HouseholdMembership,
//         as: "householdMemberships",
//         attributes: ["relation_to_head"],
//       },
//       {
//         model: Household,
//         as: "households",
//         attributes: ["household_id", "household_no", "address"],
//         through: {
//           attributes: ["start_date", "end_date", "relation_to_head", "is_head"],
//         },
//       },
//     ],
//   });

//   const dataWithAge = rows.map((person) => {
//     const personData = person.toJSON();
//     if (personData.dob) {
//       const birthYear = new Date(personData.dob).getFullYear();
//       personData.age = new Date().getFullYear() - birthYear;
//     } else {
//       personData.age = null;
//     }
//     return personData;
//   });

//   return {
//     data: dataWithAge,
//     currentPage: page,
//     totalPages: Math.ceil(count / limit),
//     totalItems: count,
//     itemsPerPage: limit,
//   };
// };

const getAllNhanKhau = async ({
  page = 1,
  limit = 20,
  search,
  gender,
  residency_status,
  minAge,
  maxAge,
  sortBy = "created_at",
  sortOrder = "DESC",
}) => {
  const offset = (page - 1) * limit;
  const whereConditions = {};

  // --- 1. Xây dựng điều kiện lọc ---
  if (search) {
    whereConditions[Op.or] = [
      { full_name: { [Op.iLike]: `%${search}%` } },
      { alias: { [Op.iLike]: `%${search}%` } },
      { citizen_id_num: { [Op.iLike]: `%${search}%` } },
    ];
  }

  if (gender) whereConditions.gender = gender;
  if (residency_status) whereConditions.residency_status = residency_status;

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
      whereConditions.dob = { [Op.lte]: new Date(`${maxBirthYear}-12-31`) };
    } else if (maxAge !== undefined) {
      const minBirthYear = currentYear - maxAge;
      whereConditions.dob = { [Op.gte]: new Date(`${minBirthYear}-01-01`) };
    }
  }

  // --- 2. Query chính lấy danh sách người ---
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
      "residency_status",
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
          attributes: ["start_date", "end_date", "relation_to_head", "is_head"],
        },
      },
    ],
    distinct: true, 
  });

  // --- 3. KỸ THUẬT BATCH QUERY (Lấy info Tạm trú/Tạm vắng) ---
  // A. Lọc ra danh sách ID của những người có trạng thái tạm thời
  const tempStatusPersonIds = rows
    .filter((p) =>
      ["temporary_resident", "temporary_absent"].includes(p.residency_status)
    )
    .map((p) => p.person_id);

  // B. Query bảng TempResidence 1 lần duy nhất (Status ACTIVE)
  let tempResidenceMap = {}; 

  if (tempStatusPersonIds.length > 0) {
    const tempRecords = await TempResidence.findAll({
      where: {
        person_id: { [Op.in]: tempStatusPersonIds },
        status: "ACTIVE", 
      },
      attributes: ["person_id", "from_date", "to_date", "type"],
    });

    // Chuyển array thành object map: { [person_id]: record }
    tempRecords.forEach((record) => {
      tempResidenceMap[record.person_id] = record;
    });
  }

  // --- 4. Map dữ liệu trả về ---
  const dataProcessed = rows.map((person) => {
    const personData = person.toJSON();

    // A. Tính tuổi
    if (personData.dob) {
      const birthYear = new Date(personData.dob).getFullYear();
      personData.age = new Date().getFullYear() - birthYear;
    } else {
      personData.age = null;
    }

    // B. Gán start_date / end_date
    personData.start_date = null;
    personData.end_date = null;

    if (
      ["temporary_resident", "temporary_absent"].includes(
        personData.residency_status
      )
    ) {
      // Lấy từ Map đã query ở bước 3
      const tempInfo = tempResidenceMap[personData.person_id];
      if (tempInfo) {
        personData.start_date = tempInfo.from_date;
        personData.end_date = tempInfo.to_date;
      }
    } else if (personData.residency_status === "permanent") {
      if (personData.households && personData.households.length > 0) {
        const membership = personData.households[0].HouseholdMembership;
        if (membership) {
          personData.start_date = membership.start_date;
        }
      }
    }

    return personData;
  });

  return {
    data: dataProcessed,
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
              residence_registered_date: "Ngày đăng ký thường trú",
              previous_address: "Địa chỉ trước đó",
            };

            const fieldNameVN = fieldNameMapping[field] || field;

            // Ghi log vào household_history
            await HouseholdHistory.create(
              {
                household_id: activeMembership.household_id,
                event_type: "other",
                field_changed: `person.${field}`,
                old_value: oldValues[field] ? String(oldValues[field]) : null,
                new_value: newValue ? String(newValue) : null,
                changed_by_user_id: userId || null,
                note: `Cập nhật ${fieldNameVN} của ${oldValues.full_name} từ "${
                  oldValues[field] || "trống"
                }" thành "${newValue || "trống"}"`,
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

let handlePersonEvent = async (
  personId,
  eventType,
  eventDate,
  note,
  destination
) => {
  const transaction = await db.sequelize.transaction();
  try {
    const person = await Person.findByPk(personId, { transaction });
    if (!person) {
      throw new Error(`Không tìm thấy nhân khẩu với ID: ${personId}`);
    }
    const activeMembership = await HouseholdMembership.findOne({
      where: {
        person_id: personId,
        end_date: null,
      },
      include: [
        {
          model: Household,
          as: "household",
          attributes: ["household_id", "household_no", "address"],
        },
      ],
      transaction,
    });
    if (!activeMembership) {
      throw new Error(`Nhân khẩu ID ${personId} không có hộ khẩu active`);
    }
    const household = activeMembership.household;

    const newStatus = eventType === "CHUYEN_DI" ? "moved_out" : "deceased";

    await person.update({ residency_status: newStatus }, { transaction });

    await activeMembership.update({ end_date: eventDate }, { transaction });
    if (activeMembership.is_head) {
      const remainingMembers = await HouseholdMembership.count({
        where: {
          household_id: household.household_id,
          person_id: { [Op.ne]: personId },
          end_date: null,
        },
        transaction,
      });
      if (remainingMembers > 0) {
        await Household.update(
          { head_person_id: null },
          {
            where: { household_id: household.household_id },
            transaction,
          }
        );
      }
    }
    const eventTypeMapping = {
      CHUYEN_DI: "move_out",
      QUA_DOI: "death",
    };
    const eventNoteMapping = {
      CHUYEN_DI: `${person.full_name} chuyển đi${
        destination ? ` đến ${destination}` : ""
      }`,
      QUA_DOI: `${person.full_name} qua đời`,
    };
    await HouseholdHistory.create(
      {
        household_id: household.household_id,
        event_type: eventTypeMapping[eventType],
        old_value: JSON.stringify({
          person_id: personId,
          full_name: person.full_name,
          reason: eventType.toLowerCase(),
        }),
        changed_by_user_id: null,
        note: note || eventNoteMapping[eventType],
      },
      { transaction }
    );

    const personEventTypeMapping = {
      CHUYEN_DI: "move_out",
      QUA_DOI: "death",
    };
    await PersonEvent.create(
      {
        person_id: personId,
        event_type: personEventTypeMapping[eventType],
        event_date: eventDate,
        place_or_destination: destination || null,
        old_household_id: household.household_id,
        new_household_id: null,
        created_by: null,
        note: note || eventNoteMapping[eventType],
      },
      { transaction }
    );
    await transaction.commit();

    const updatedPerson = await Person.findByPk(personId, {
      attributes: [
        "person_id",
        "full_name",
        "gender",
        "dob",
        "residency_status",
      ],
    });

    const updatedHousehold = await Household.findByPk(household.household_id, {
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
              attributes: ["person_id", "full_name", "gender", "dob"],
            },
          ],
        },
      ],
    });
    return {
      person: updatedPerson,
      household: updatedHousehold,
      eventInfo: {
        event_type: eventType,
        event_date: eventDate,
        old_household: {
          household_id: household.household_id,
          household_no: household.household_no,
        },
        note: note || eventNoteMapping[eventType],
      },
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// const getPersonDetail = async (personId) => {
//   const person = await Person.findByPk(personId, {
//     // include: [{ model: Household, as: 'household', attributes: ['household_no', 'address'] }],
//   });

//   if(!person) {
//     return null;
//   }

//   return person;
// };

const getPersonDetail = async (personId) => {
  // 1. Lấy thông tin cơ bản của Person kèm theo Hộ khẩu (để lấy địa chỉ, mã hộ)
  const personInstance = await Person.findByPk(personId, {
    include: [
      {
        model: Household,
        as: "households", // Alias phải khớp với định nghĩa trong model/index (thường là 'households')
        through: {
          model: HouseholdMembership,
          where: { end_date: null },
          required: false,
          attributes: ["is_head", "relation_to_head", "start_date"],
        },
        attributes: ["household_no", "address", "household_id"],
      },
    ],
  });

  if (!personInstance) {
    return null;
  }

  // 2. Chuyển sang JSON object thuần để có thể gán thêm thuộc tính start_date/end_date
  const person = personInstance.toJSON();

  // Mặc định start_date/end_date rỗng
  person.start_date = null;
  person.end_date = null;

  // 3. Xử lý Logic cho Tạm trú / Tạm vắng
  if (
    person.residency_status === "temporary_resident" ||
    person.residency_status === "temporary_absent"
  ) {
    const tempRecord = await TempResidence.findOne({
      where: {
        person_id: personId,
        status: "ACTIVE",
      },
      order: [["registered_at", "DESC"]],
    });

    if (tempRecord) {
      person.start_date = tempRecord.from_date;
      person.end_date = tempRecord.to_date;
    }
  } else if (person.residency_status === "permanent") {
    if (person.households && person.households.length > 0) {
      const membership = person.households[0].HouseholdMembership;
      if (membership) {
        person.start_date = membership.start_date;
      }
    }
  }

  return person;
};

export default {
  getAllNhanKhau,
  getNhanKhauById,
  updateNhanKhau,
  getPersonEvents,
  handlePersonEvent,
  getPersonDetail,
};
