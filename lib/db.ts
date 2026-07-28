import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDirectory = path.join(process.cwd(), "data");

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

const dbPath = path.join(dataDirectory, "todos.db");

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    due_date TEXT NOT NULL,
    topic TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Todo', 'In-Progress', 'Complete')),
    archived_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

export default db;