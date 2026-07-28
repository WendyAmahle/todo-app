import db from "./db";

export type TaskStatus = "Todo" | "In-Progress" | "Complete";

export interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  topic: string;
  status: TaskStatus;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export function createTask(
  title: string,
  description: string,
  dueDate: string,
  topic: string,
  status: TaskStatus
) {
  const now = new Date().toISOString();

  const statement = db.prepare(`
    INSERT INTO tasks (
      title,
      description,
      due_date,
      topic,
      status,
      archived_at,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, NULL, ?, ?)
  `);

  const result = statement.run(
    title,
    description,
    dueDate,
    topic,
    status,
    now,
    now
  );

  return db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(result.lastInsertRowid) as Task;
}

export function getTasks(includeArchived = false) {
  if (includeArchived) {
    return db
      .prepare("SELECT * FROM tasks ORDER BY due_date ASC")
      .all() as Task[];
  }

  return db
    .prepare(`
      SELECT * FROM tasks
      WHERE archived_at IS NULL
      ORDER BY due_date ASC
    `)
    .all() as Task[];
}

export function getTaskById(id: number) {
  return db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(id) as Task | undefined;
}

export function updateTask(
  id: number,
  title: string,
  description: string,
  dueDate: string,
  topic: string,
  status: TaskStatus
) {
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE tasks
    SET
      title = ?,
      description = ?,
      due_date = ?,
      topic = ?,
      status = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    title,
    description,
    dueDate,
    topic,
    status,
    now,
    id
  );

  return getTaskById(id);
}

export function archiveTask(id: number) {
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE tasks
    SET archived_at = ?, updated_at = ?
    WHERE id = ?
  `).run(now, now, id);

  return getTaskById(id);
}