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

        const maxPool = parseInt(process.env.DB_POOL_MAX || "20", 10);
        const minPool = parseInt(process.env.DB_POOL_MIN || "2", 10);
        const idleTimeoutMillis = parseInt(
            process.env.DB_POOL_IDLE_TIMEOUT_MS || "30000",
            10
        );
        const connectionTimeoutMillis = parseInt(
            process.env.DB_POOL_CONN_TIMEOUT_MS || "2000",
            10
        );

        pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            ssl: useSsl ? { rejectUnauthorized } : false,
            max: Number.isNaN(maxPool) ? 20 : maxPool,
            min: Number.isNaN(minPool) ? 2 : minPool,
            idleTimeoutMillis: Number.isNaN(idleTimeoutMillis) ? 30000 : idleTimeoutMillis,
            connectionTimeoutMillis: Number.isNaN(connectionTimeoutMillis)
                ? 2000
                : connectionTimeoutMillis,
        });
        console.log("🟢 PostgreSQL pool created");
    }
    return pool;
  }

export default getPool;
