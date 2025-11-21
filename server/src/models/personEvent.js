"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
    class PersonEvent extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // PersonEvent belongsTo Person
            PersonEvent.belongsTo(models.Person, {
                foreignKey: "person_id",
                targetKey: "person_id",
                as: "person",
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            });

            // PersonEvent belongsTo User (created_by)
            // PersonEvent.belongsTo(models.User, {
            //     foreignKey: "created_by",
            //     targetKey: "user_id",
            //     as: "creator",
            //     onDelete: "SET NULL",
            //     onUpdate: "CASCADE",
            // });

            // PersonEvent belongsTo old Household
            PersonEvent.belongsTo(models.Household, {
                foreignKey: "old_household_id",
                targetKey: "household_id",
                as: "oldHousehold",
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            });

            // PersonEvent belongsTo new Household
            PersonEvent.belongsTo(models.Household, {
                foreignKey: "new_household_id",
                targetKey: "household_id",
                as: "newHousehold",
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            });
        }
    }

    PersonEvent.init(
        {
            event_id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            person_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                references: {
                    model: {
                        tableName: "person",
                        schema: "core",
                    },
                    key: "person_id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            created_by: {
                type: DataTypes.BIGINT,
                allowNull: true,
                references: {
                    model: {
                        tableName: "users", // Thay đổi tên bảng user nếu cần
                        schema: "core",
                    },
                    key: "user_id",
                },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            },
            event_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            event_type: {
                type: DataTypes.ENUM(
                    "birth",
                    "moved_in",
                    "move_out",
                    "death",
                    "head_change",
                    "split_household",
                    "temporary_resident",
                    "temporary_absence",
                    "other"
                ),
                allowNull: false,
            },
            place_or_destination: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            old_household_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
                references: {
                    model: {
                        tableName: "household",
                        schema: "core",
                    },
                    key: "household_id",
                },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            },
            new_household_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
                references: {
                    model: {
                        tableName: "household",
                        schema: "core",
                    },
                    key: "household_id",
                },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            },
            note: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "PersonEvent",
            tableName: "person_event",
            schema: "core",
            timestamps: false,
            indexes: [
                {
                    fields: ["person_id"],
                    name: "idx_person_event_person",
                },
                {
                    fields: ["event_type"],
                    name: "idx_person_event_type",
                },
                {
                    fields: ["event_date"],
                    name: "idx_person_event_date",
                },
                {
                    fields: ["old_household_id"],
                    name: "idx_person_event_old_household",
                },
                {
                    fields: ["new_household_id"],
                    name: "idx_person_event_new_household",
                },
                {
                    fields: ["created_by"],
                    name: "idx_person_event_created_by",
                },
            ],
        }
    );

    return PersonEvent;
};
