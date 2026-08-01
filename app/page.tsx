"use client";

import { FormEvent, useEffect, useState } from "react";

type TaskStatus = "Todo" | "In-Progress" | "Complete";

interface Task {
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

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState<TaskStatus>("Todo");

  const [editingTaskId, setEditingTaskId] = 
    useState<number | null>(null);

  const [showArchived, setShowArchived] = useState(false);

  const [sortBy, setSortBy] =
    useState<"topic" | "status" | "due_date">(
      "due_date"
    );

  async function fetchTasks() {
    try {
      setLoading(true);

      const response = await fetch(
        showArchived
        ? "/api/tasks?includeArchived=true"
        : "/api/tasks"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();

      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, [showArchived]);

  const sortedTasks = [...tasks].sort((a, b) => {
  if (sortBy === "topic") {
    return a.topic.localeCompare(b.topic);
  }

  if (sortBy === "status") {
    return a.status.localeCompare(b.status);
  }

  return (
    new Date(a.due_date).getTime() -
    new Date(b.due_date).getTime()
  );
});

async function handleSubmit(
  event: FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  try {
    const url = editingTaskId
      ? `/api/tasks/${editingTaskId}`
      : "/api/tasks";

    const method = editingTaskId
      ? "PUT"
      : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        dueDate,
        topic,
        status,
      }),
    });

    if (!response.ok) {
      throw new Error(
        editingTaskId
          ? "Failed to update task"
          : "Failed to create task"
      );
    }

    // Clear the form
    setTitle("");
    setDescription("");
    setDueDate("");
    setTopic("");
    setStatus("Todo");

    // Exit editing mode
    setEditingTaskId(null);

    // Refresh tasks
    await fetchTasks();

  } catch (error) {
    console.error(error);

    alert(
      editingTaskId
        ? "Failed to update task"
        : "Failed to create task"
    );
  }
} 

function startEditing(task: Task) {
  setEditingTaskId(task.id);

  setTitle(task.title);
  setDescription(task.description);
  setDueDate(task.due_date);
  setTopic(task.topic);
  setStatus(task.status);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

async function archiveTask(taskId: number) {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
    });

    if (!response.ok) {
      throw new Error("Failed to archive task");
    }

    await fetchTasks();
  } catch (error) {
    console.error("Error archiving task:", error);
    alert("Failed to archive task");
  }
}

  return (
    <main style={styles.container}>
      <h1 style={styles.heading}>My Todo App</h1>

      <section style={styles.card}>
        <h2>
          {editingTaskId
          ? "Edit Task"
          : "Create a Task"}
          </h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label>
            Title
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              style={styles.input}
            />
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              required
              style={styles.textarea}
            />
          </label>

          <label>
            Due Date
            <input
              type="date"
              value={dueDate}
              onChange={(event) =>
                setDueDate(event.target.value)
              }
              required
              style={styles.input}
            />
          </label>

          <label>
            Topic
            <input
              type="text"
              value={topic}
              onChange={(event) =>
                setTopic(event.target.value)
              }
              required
              style={styles.input}
            />
          </label>

          <label>
            Status
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as TaskStatus)
              }
              style={styles.input}
            >
              <option value="Todo">Todo</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Complete">Complete</option>
            </select>
          </label>

          <button type="submit" style={styles.button}>
            {editingTaskId
            ? "Save Changes"
            : "Add Task"}
          </button>
        </form>
      </section>

      <section style={styles.card}>
        <h2>
          {showArchived
          ? "Archived Tasks"
          : "My Tasks"}
        </h2>

        <button
        onClick={() => {
          setShowArchived(!showArchived);
        }}
        style={styles.button}
        >
          {showArchived
          ? "View Active Tasks"
          : "View Archived Tasks"}

        </button>

        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p>No tasks yet.</p>
        ) : (
          <div>
            {sortedTasks.map((task) => (
              <article key={task.id} style={styles.task}>
                <h3>{task.title}</h3>

                <p>{task.description}</p>

                <p>
                  <strong>Topic:</strong> {task.topic}
                </p>

                <p>
                  <strong>Due:</strong> {task.due_date}
                </p>

                <p>
                  <strong>Status:</strong> {task.status}
                </p>

                <button
                  onClick={() => startEditing(task)}
                  style={styles.button}
                  >
                  Edit
                </button>

                <button
                  onClick={() => archiveTask(task.id)}
                  style={styles.button}
                >
                  Archive 
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "Arial, sans-serif",
  },

  heading: {
    textAlign: "center" as const,
    marginBottom: "30px",
  },

  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "25px",
    marginBottom: "30px",
  },

  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "15px",
  },

  input: {
    display: "block",
    width: "100%",
    padding: "10px",
    marginTop: "5px",
    boxSizing: "border-box" as const,
  },

  textarea: {
    display: "block",
    width: "100%",
    minHeight: "100px",
    padding: "10px",
    marginTop: "5px",
    boxSizing: "border-box" as const,
  },

  button: {
    padding: "12px",
    cursor: "pointer",
  },

  task: {
    borderTop: "1px solid #ddd",
    padding: "15px 0",
  },
};