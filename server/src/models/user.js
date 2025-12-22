"use strict";
import { Model } from "sequelize";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const pepperPassword = (password) => {
  if (!process.env.PASSWORD_PEPPER) {
    throw new Error("Chưa cấu hình PASSWORD_PEPPER trong file .env");
  }

  return crypto
    .createHmac("sha256", process.env.PASSWORD_PEPPER)
    .update(password)
    .digest("hex");
};

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      //1 user có thể thực hiện nhiều thay đổi lịch sử
      //dùng để link user với householdHistory sau này
    }

    async isValidPassword(password) {
      const passwordWithPepper = pepperPassword(password);
      return await bcrypt.compare(passwordWithPepper, this.password);
    }
  }

  User.init(
    {
      user_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "AdminGroup",
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: "admin", // admin hoặc accountant
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      schema: "core",
      timestamps: true,
      hooks: {
        // Tự động mã hóa mật khẩu trước khi tạo
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            const passwordWithPepper = pepperPassword(user.password);
            user.password = await bcrypt.hash(passwordWithPepper, salt);
          }
        },
        // Tự động mã hóa khi update mật khẩu
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            const passwordWithPepper = pepperPassword(user.password);
            user.password = await bcrypt.hash(passwordWithPepper, salt);
          }
        },
      },
    }
  );

  return User;
};
