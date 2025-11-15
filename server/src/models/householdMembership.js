"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
    class HouseholdMembership extends Model {
        static associate(models) {
            HouseholdMembership.belongsTo(models.Household, {
                foreignKey: "household_id",
                targetKey: "household_id",
                as: "household",
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            });

            HouseholdMembership.belongsTo(models.Person, {
                foreignKey: "person_id",
                targetKey: "person_id",
                as: "person",
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            });
        }

        isActive() {
            const today = new Date();
            const startDate = new Date(this.start_date);
            const endDate = this.end_date ? new Date(this.end_date) : null;

            return startDate <= today && (!endDate || endDate >= today);
        }

        isHouseholdHead() {
            return this.is_head === true;
        }
    }

    HouseholdMembership.init(
        {
            household_id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
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
            person_id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
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
            start_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            end_date: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                validate: {
                    isAfterStartDate(value) {
                        if (
                            value &&
                            this.start_date &&
                            value < this.start_date
                        ) {
                            throw new Error(
                                "end_date must be greater than or equal to start_date"
                            );
                        }
                    },
                },
            },
            relation_to_head: {
                type: DataTypes.STRING(80),
                allowNull: true,
            },
            is_head: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            membership_type: {
                type: DataTypes.ENUM(
                    "family_member",
                    "temporary_renter",
                    "business_renter",
                    "other"
                ),
                allowNull: true,
                defaultValue: "family_member",
            },
        },
        {
            sequelize,
            modelName: "HouseholdMembership",
            tableName: "household_membership",
            schema: "core",
            timestamps: false,
            indexes: [
                {
                    unique: true,
                    fields: ["household_id", "person_id"],
                    name: "household_membership_pkey",
                },
                {
                    fields: ["person_id"],
                    name: "idx_household_membership_person",
                },
                {
                    fields: ["household_id"],
                    name: "idx_household_membership_household",
                },
                {
                    fields: ["is_head"],
                    name: "idx_household_membership_is_head",
                },
                {
                    fields: ["start_date", "end_date"],
                    name: "idx_household_membership_dates",
                },
            ],
        }
    );

    return HouseholdMembership;
};
