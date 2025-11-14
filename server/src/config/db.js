import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.connect()
    .then(() => console.log("✅ Kết nối PostgreSQL thành công!"))
    .catch((err) => console.error("❌ Lỗi kết nối PostgreSQL:", err));

export default pool;
