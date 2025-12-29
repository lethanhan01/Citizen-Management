"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
    class Campaign extends Model {
        static associate(models) {
            // Một chiến dịch có nhiều lượt đóng góp
            Campaign.hasMany(models.CampaignPayment, {
                foreignKey: "campaign_id",
                as: "contributions",
            });
        }
    }

    Campaign.init(
        {
            campaign_id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            note: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            // description: {
            //     type: DataTypes.TEXT,
            //     allowNull: true,
            //     field: "note", // map attribute description -> DB column note
            // },

            start_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            end_date: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "Campaign",
            tableName: "campaign",
            schema: "finance",
            timestamps: false,
        }
    );
    return Campaign;
};