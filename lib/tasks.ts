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
): Promise<Task> {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();

    const sql = `
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
    `;

    db.run(
      sql,
      [
        title,
        description,
        dueDate,
        topic,
        status,
        now,
        now,
      ],
      function (error) {
        if (error) {
          reject(error);
          return;
        }

        getTaskById(this.lastID)
          .then((task) => {
            if (!task) {
              reject(new Error("Task was created but could not be found."));
              return;
            }

            resolve(task);
          })
          .catch(reject);
      }
    );
  });
}

export function getTasks(
  includeArchived = false
): Promise<Task[]> {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT *
      FROM tasks
    `;

    if (!includeArchived) {
      sql += `
        WHERE archived_at IS NULL
      `;
    }

    sql += `
      ORDER BY due_date ASC
    `;

    db.all(sql, [], (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows as Task[]);
    });
  });
}

export function getTaskById(
  id: number
): Promise<Task | undefined> {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM tasks WHERE id = ?",
      [id],
      (error, row) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(row as Task | undefined);
      }
    );
  });
}

export function updateTask(
  id: number,
  title: string,
  description: string,
  dueDate: string,
  topic: string,
  status: TaskStatus
): Promise<Task | undefined> {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();

    const sql = `
      UPDATE tasks
      SET
        title = ?,
        description = ?,
        due_date = ?,
        topic = ?,
        status = ?,
        updated_at = ?
      WHERE id = ?
    `;

    db.run(
      sql,
      [
        title,
        description,
        dueDate,
        topic,
        status,
        now,
        id,
      ],
      function (error) {
        if (error) {
          reject(error);
          return;
        }

        getTaskById(id)
          .then(resolve)
          .catch(reject);
      }
    );
  });
}

export function archiveTask(
  id: number
): Promise<Task | undefined> {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();

    const sql = `
      UPDATE tasks
      SET
        archived_at = ?,
        updated_at = ?
      WHERE id = ?
    `;

    db.run(
      sql,
      [now, now, id],
      function (error) {
        if (error) {
          reject(error);
          return;
        }

        getTaskById(id)
          .then(resolve)
          .catch(reject);
      }
    );
  });
}