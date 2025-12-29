"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
    class HouseholdHistory extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // HouseholdHistory belongsTo Household
            HouseholdHistory.belongsTo(models.Household, {
                foreignKey: "household_id",
                targetKey: "household_id",
                as: "household",
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            });

            // HouseholdHistory belongsTo User (nếu có bảng User)
            // HouseholdHistory.belongsTo(models.User, {
            //     foreignKey: "changed_by_user_id",
            //     targetKey: "user_id",
            //     as: "changedByUser",
            //     onDelete: "SET NULL",
            //     onUpdate: "CASCADE",
            // });
        }
    }

    HouseholdHistory.init(
        {
            history_id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            household_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                references: {
                    model: {
                        tableName: "household",
                        schema: "core",
                    },
                    key: "household_id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            event_type: {
                type: DataTypes.ENUM(
                    "birth",
                    "move_in",
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
            field_changed: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            old_value: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            new_value: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            changed_at: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: DataTypes.NOW,
            },
            changed_by_user_id: {
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
            note: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "HouseholdHistory",
            tableName: "household_history",
            schema: "core",
            timestamps: false,
            indexes: [
                {
                    fields: ["household_id"],
                    name: "idx_household_history_household",
                },
                {
                    fields: ["event_type"],
                    name: "idx_household_history_event_type",
                },
                {
                    fields: ["changed_at"],
                    name: "idx_household_history_changed_at",
                },
                {
                    fields: ["changed_by_user_id"],
                    name: "idx_household_history_changed_by",
                },
            ],
        }
    );

    return HouseholdHistory;
};
