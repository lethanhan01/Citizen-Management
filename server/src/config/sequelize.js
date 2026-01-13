import { Sequelize } from "sequelize";
import "dotenv/config";

const sslFlag = (process.env.DB_SSL || "").toLowerCase();
const useSsl = sslFlag === "true";

console.log(`[DB] Sequelize target host=${process.env.DB_HOST} ssl=${useSsl}`);

const sequelize = new Sequelize(
  process.env.DB_NAME, // database name
  process.env.DB_USER, // username
  process.env.DB_PASSWORD, // password
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false, // ẩn log SQL cho gọn
    dialectOptions: useSsl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false, // Chấp nhận chứng chỉ SSL của Supabase
          },
        }
      : { ssl: false },
  }
);

console.log("[DB] dialectOptions", sequelize.options.dialectOptions);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối Sequelize với Supabase thành công!");
  } catch (error) {
    console.error("❌ Kết nối thất bại:", error);
  }
}

connectDB();

export default sequelize;
