"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
    class Person extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // Define associations here if needed
            // Example: Person.belongsTo(models.Household, { foreignKey: 'household_id' });
            // Example: Person.hasMany(models.HouseholdMember, { foreignKey: 'person_id' });
            Person.hasMany(models.Household, {
                foreignKey: "head_person_id",
                sourceKey: "person_id",
                as: "householdsAsHead",
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            });

            Person.hasMany(models.HouseholdMembership, {
                foreignKey: "person_id",
                sourceKey: "person_id",
                as: "householdMemberships",
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            });

            Person.belongsToMany(models.Household, {
                through: models.HouseholdMembership,
                foreignKey: "person_id",
                otherKey: "household_id",
                as: "households",
            });

            Person.hasMany(models.PersonEvent, {
                foreignKey: "person_id",
                sourceKey: "person_id",
                as: "events",
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            });

            Person.hasMany(models.TempResidence, {
                foreignKey: "person_id",
                sourceKey: "person_id",
                as: "tempResidences",
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            });
        }
    }

    Person.init(
        {
            person_id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            full_name: {
                type: DataTypes.STRING(150),
                allowNull: false,
            },
            alias: {
                type: DataTypes.STRING(150),
                allowNull: true,
            },
            gender: {
                type: DataTypes.ENUM("male", "female", "other"),
                allowNull: true,
            },
            dob: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            birthplace: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            ethnicity: {
                type: DataTypes.STRING(80),
                allowNull: true,
            },
            hometown: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            occupation: {
                type: DataTypes.STRING(150),
                allowNull: true,
            },
            workplace: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            citizen_id_num: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            citizen_id_issued_date: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            citizen_id_issued_place: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            residency_status: {
                type: DataTypes.ENUM(
                    "permanent",
                    "temporary_resident",
                    "temporary_absent",
                    "moved_out",
                    "deceased"
                ),
                allowNull: true,
                defaultValue: "permanent",
            },
            residence_registered_date: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            previous_address: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: "Person",
            tableName: "person",
            schema: "core",
            timestamps: false,
        }
    );

    return Person;
};
