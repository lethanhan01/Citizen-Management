import { Sequelize } from "sequelize";
import "dotenv/config";

const sslFlag = (process.env.DB_SSL || "").toLowerCase();
const useSsl = sslFlag === "true";
const rejectUnauthorizedFlag = (process.env.DB_SSL_REJECT_UNAUTHORIZED || "").toLowerCase();
const rejectUnauthorized =
  rejectUnauthorizedFlag === "true"
    ? true
    : rejectUnauthorizedFlag === "false"
      ? false
      : process.env.NODE_ENV === "production";

console.log(`[DB] Sequelize target host=${process.env.DB_HOST} ssl=${useSsl}`);

const sequelize = new Sequelize(
  process.env.DB_NAME, // database name
  process.env.DB_USER, // username
  process.env.DB_PASSWORD, // password
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    dialectOptions: useSsl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized,
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
