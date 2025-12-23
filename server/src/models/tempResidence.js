"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
    class TempResidence extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // Define association with Person model
            TempResidence.belongsTo(models.Person, {
                foreignKey: "person_id",
                targetKey: "person_id",
                as: "person",
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            });
            // Define association with Household model
            TempResidence.belongsTo(models.Household, {
                foreignKey: "household_id",
                targetKey: "household_id",
                as: "household",
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            });

            TempResidence.belongsTo(models.User, {
                foreignKey: "registered_by_person_id",
                targetKey: "user_id",
                as: "registeredBy",
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            });
        }
    }

    TempResidence.init(
        {
            temp_residence_id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            person_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            type: {
                type: DataTypes.ENUM("TEMPORARY_STAY", "TEMPORARY_ABSENCE"),
                allowNull: false,
            },
            household_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            from_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            to_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM("ACTIVE", "EXPIRED", "CANCELLED"),
                allowNull: false,
                defaultValue: "ACTIVE",
            },
            registered_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            registered_by_person_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
            },
            note: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "TempResidence",
            tableName: "temporary_residence",
            schema: "core",
            timestamps: false,
            validate: {
                dateCheck() {
                    if (this.to_date < this.from_date) {
                        throw new Error(
                            "to_date must be greater than or equal to from_date"
                        );
                    }
                },
            },
        }
    );

    return TempResidence;
};
