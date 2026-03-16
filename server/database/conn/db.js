import Database from "better-sqlite3";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const dbPath = path.resolve(process.env.DB_PATH);

const db = new Database(dbPath, {
  verbose: console.log,
});

export default db;
