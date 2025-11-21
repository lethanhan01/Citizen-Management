"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
    class Household extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // Define associations here if needed
            // Example: Household.belongsTo(models.Person, { foreignKey: 'head_person_id' });
            Household.belongsTo(models.Person, {
                foreignKey: "head_person_id",
                targetKey: "person_id",
                as: "headPerson",
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            });
            Household.hasMany(models.HouseholdMembership, {
                foreignKey: "household_id",
                sourceKey: "household_id",
                as: "members",
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            });
            Household.belongsToMany(models.Person, {
                through: models.HouseholdMembership,
                foreignKey: "household_id",
                otherKey: "person_id",
                as: "residents",
            });
            Household.hasMany(models.HouseholdHistory, {
                foreignKey: "household_id",
                sourceKey: "household_id",
                as: "history",
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            });

            Household.hasMany(models.PersonEvent, {
                foreignKey: "old_household_id",
                sourceKey: "household_id",
                as: "oldHousehold",
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            });
            Household.hasMany(models.PersonEvent, {
                foreignKey: "new_household_id",
                sourceKey: "household_id",
                as: "newHousehold",
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            });
        }
    }

    Household.init(
        {
            household_id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            household_no: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            address: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            head_person_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
            },
            note: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            household_type: {
                type: DataTypes.ENUM("family", "renter_group", "business"),
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "Household",
            tableName: "household",
            schema: "core",
            timestamps: false,
        }
    );

    return Household;
};
