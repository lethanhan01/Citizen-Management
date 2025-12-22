import express from "express";
import cors from "cors";
import getPool from "./config/db.js";
import sequelize from "./config/sequelize.js";
import db from "./models/index.js";
import initWebRoutes from "./routes/web.js";

const app = express();
const pool = getPool();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Node.js backend!");
});

app.get("/campaigns", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM finance.campaign");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi truy vấn database");
    }
  try {
    const result = await pool.query("SELECT * FROM finance.campaign");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi truy vấn database");
  }
});

initWebRoutes(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
});
