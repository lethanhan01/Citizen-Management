import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .connect()
  .then(() => console.log("✅ Kết nối PG Pool với Supabase thành công!"))
  .catch((err) => console.error("❌ Lỗi kết nối PG Pool:", err));

export default pool;
