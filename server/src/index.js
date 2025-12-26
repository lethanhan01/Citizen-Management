import express from "express";
import cors from "cors";
import getPool from "./config/db.js";
import sequelize from "./config/sequelize.js";
import db from "./models/index.js";
import initWebRoutes from "./routes/web.js";
import errorHandler from "./middleware/errorHandler.js";
import "dotenv/config";

const app = express();
const pool = getPool();

// CORS: chỉ cho phép domain FE
const allowed = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow same-origin/non-browser
    if (allowed.length === 0 || allowed.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: false, // dùng Bearer token
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello from Node.js backend!");
});

// Health endpoint
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ success: true, message: "OK", data: { status: "ok" } });
});

app.get("/campaigns", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM finance.campaign");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi truy vấn database");
    }
});

initWebRoutes(app);

// Global error handler (must be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
});
