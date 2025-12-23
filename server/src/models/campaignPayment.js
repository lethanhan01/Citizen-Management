"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class CampaignPayment extends Model {
    static associate(models) {
      CampaignPayment.belongsTo(models.Campaign, {
        foreignKey: "campaign_id",
        as: "campaign",
      });
      CampaignPayment.belongsTo(models.Household, {
        foreignKey: "household_id",
        as: "household",
      });
    }
  }

  CampaignPayment.init(
    {
        campaign_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
        },
        household_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(14, 2),
            allowNull: false,
        },
        contribution_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("pending", "paid", "partial"),
            allowNull: false,
            defaultValue: "pending",
        },
        note: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "CampaignPayment",
        tableName: "campaign_payment",
        schema: "finance",
        timestamps: false,
    }
  );

  return CampaignPayment;
};
