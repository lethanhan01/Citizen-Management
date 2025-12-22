import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import path from "path";
import Sequelize from "sequelize";
import process from "process";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";

// Import config.json
import configFile from "../config/config.json" with { type: "json" };
const config = configFile[env];

if (process.env.DB_USER) {
    console.log("🔄 Đang dùng cấu hình từ .env cho Sequelize Models...");
    config.username = process.env.DB_USER;
    config.password = process.env.DB_PASSWORD;
    config.database = process.env.DB_NAME;
    config.host = process.env.DB_HOST;
    config.port = process.env.DB_PORT;
    config.dialect = "postgres";
    
    // Bắt buộc bật SSL cho Supabase
    config.dialectOptions = {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    };
}

const db = {};

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config
    );
}

// Đọc các file models
const files = fs.readdirSync(__dirname).filter((file) => {
    return (
        file.indexOf(".") !== 0 &&
        file !== basename &&
        file.slice(-3) === ".js" &&
        file.indexOf(".test.js") === -1
    );
});

// Import models động với ES6
for (const file of files) {
    const filePath = path.join(__dirname, file);
    const fileUrl = `file:///${filePath.replace(/\\/g, "/")}`;
    const modelModule = await import(fileUrl);
    const model = modelModule.default(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
}

// Thiết lập associations
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
