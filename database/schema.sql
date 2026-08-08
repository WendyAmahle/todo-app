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
);