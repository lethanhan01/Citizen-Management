import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

let pool;

function getPool() {
    if (!pool) {
        const sslFlag = (process.env.DB_SSL || "").toLowerCase();
        const useSsl = sslFlag === "true";
        const rejectUnauthorizedFlag = (process.env.DB_SSL_REJECT_UNAUTHORIZED || "").toLowerCase();
        const rejectUnauthorized =
            rejectUnauthorizedFlag === "true"
                ? true
                : rejectUnauthorizedFlag === "false"
                    ? false
                    : process.env.NODE_ENV === "production";

        pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            ssl: useSsl ? { rejectUnauthorized } : false,
            max: 5, // 👈 giới hạn connection
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        console.log("🟢 PostgreSQL pool created");
    }
    return pool;
  }

export default getPool;
