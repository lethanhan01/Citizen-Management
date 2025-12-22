import express from "express";
import pool from "./config/db.js";
import sequelize from "./config/sequelize.js";
import cors from "cors";
import initWebRoutes from "./routes/web.js";

const app = express();
const PORT = 5000;

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
});
initWebRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
