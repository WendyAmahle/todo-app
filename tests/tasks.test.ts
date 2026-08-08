import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";

const testDirectory = fs.mkdtempSync(
  path.join(os.tmpdir(), "todo-app-test-")
);

const testDatabasePath = path.join(
  testDirectory,
  "test.db"
);

process.env.TODO_DB_PATH = testDatabasePath;

let db: typeof import("../lib/db").default;
let createTask: typeof import("../lib/tasks").createTask;
let getTasks: typeof import("../lib/tasks").getTasks;
let getTaskById: typeof import("../lib/tasks").getTaskById;
let updateTask: typeof import("../lib/tasks").updateTask;
let archiveTask: typeof import("../lib/tasks").archiveTask;

beforeAll(async () => {
  const dbModule = await import("../lib/db");
  const tasksModule = await import("../lib/tasks");

  db = dbModule.default;

  createTask = tasksModule.createTask;
  getTasks = tasksModule.getTasks;
  getTaskById = tasksModule.getTaskById;
  updateTask = tasksModule.updateTask;
  archiveTask = tasksModule.archiveTask;
});

beforeEach(async () => {
  await new Promise<void>((resolve, reject) => {
    db.run("DELETE FROM tasks", (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve) => {
    db.close(() => resolve());
  });

  fs.rmSync(testDirectory, {
    recursive: true,
    force: true,
  });
});

describe("Task database behaviour", () => {
  it("creates and retrieves a task", async () => {
    const task = await createTask(
      "Test Task",
      "Testing task creation",
      "2026-08-10",
      "Testing",
      "Todo"
    );

    expect(task.title).toBe("Test Task");
    expect(task.description).toBe("Testing task creation");
    expect(task.due_date).toBe("2026-08-10");
    expect(task.topic).toBe("Testing");
    expect(task.status).toBe("Todo");

    const savedTask = await getTaskById(task.id);

    expect(savedTask).toBeDefined();
    expect(savedTask?.title).toBe("Test Task");
  });

  it("updates an existing task", async () => {
    const task = await createTask(
      "Original Task",
      "Original description",
      "2026-08-10",
      "Testing",
      "Todo"
    );

    const updatedTask = await updateTask(
      task.id,
      "Updated Task",
      "Updated description",
      "2026-08-15",
      "COMS3011",
      "In-Progress"
    );

    expect(updatedTask).toBeDefined();
    expect(updatedTask?.title).toBe("Updated Task");
    expect(updatedTask?.description).toBe(
      "Updated description"
    );
    expect(updatedTask?.due_date).toBe("2026-08-15");
    expect(updatedTask?.topic).toBe("COMS3011");
    expect(updatedTask?.status).toBe("In-Progress");
  });

  it("archives a task without deleting it", async () => {
    const task = await createTask(
      "Archive Me",
      "This task should be archived",
      "2026-08-10",
      "Testing",
      "Complete"
    );

    const archivedTask = await archiveTask(task.id);

    expect(archivedTask).toBeDefined();
    expect(archivedTask?.archived_at).not.toBeNull();

    const activeTasks = await getTasks(false);

    expect(
      activeTasks.some((item) => item.id === task.id)
    ).toBe(false);

    const allTasks = await getTasks(true);

    expect(
      allTasks.some((item) => item.id === task.id)
    ).toBe(true);
  });

  it("stores the due date needed to identify overdue tasks", async () => {
    const task = await createTask(
      "Overdue Task",
      "This task has a past due date",
      "2026-07-30",
      "Testing",
      "Todo"
    );

    const savedTask = await getTaskById(task.id);

    expect(savedTask).toBeDefined();

    const today = new Date("2026-08-08");
    const dueDate = new Date(savedTask!.due_date);

    const isOverdue =
      dueDate < today &&
      savedTask!.status !== "Complete";

    expect(isOverdue).toBe(true);
  });
});