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
            timestamps: false, // Đã có cột created_at, không cần thêm createdAt/updatedAt
        }
    );

    return Household;
};
