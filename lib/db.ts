import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";

sqlite3.verbose();

const dataDirectory = path.join(process.cwd(), "data");

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

const dbPath = path.join(dataDirectory, "todos.db");

const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error("Error opening SQLite database:", error.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      due_date TEXT NOT NULL,
      topic TEXT NOT NULL,
      status TEXT NOT NULL CHECK (
        status IN ('Todo', 'In-Progress', 'Complete')
      ),
      archived_at TEXT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
});

export default db;