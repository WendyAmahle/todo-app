import { NextRequest, NextResponse } from "next/server";
import {
  getTaskById,
  updateTask,
  archiveTask,
  TaskStatus,
} from "@/lib/tasks";

const validStatuses: TaskStatus[] = [
  "Todo",
  "In-Progress",
  "Complete",
];

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const taskId = Number(id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: "Invalid task ID" },
        { status: 400 }
      );
    }

    const task = getTaskById(taskId);

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);

    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const taskId = Number(id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: "Invalid task ID" },
        { status: 400 }
      );
    }

    const existingTask = getTaskById(taskId);

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const {
      title,
      description,
      dueDate,
      topic,
      status,
    } = body;

    if (!title || !description || !dueDate || !topic || !status) {
      return NextResponse.json(
        { error: "All task fields are required" },
        { status: 400 }
      );
    }

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error:
            "Invalid status. Status must be Todo, In-Progress, or Complete.",
        },
        { status: 400 }
      );
    }

    const updatedTask = updateTask(
      taskId,
      title,
      description,
      dueDate,
      topic,
      status
    );

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);

    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const taskId = Number(id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: "Invalid task ID" },
        { status: 400 }
      );
    }

    const existingTask = getTaskById(taskId);

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const archivedTask = archiveTask(taskId);

    return NextResponse.json(archivedTask);
  } catch (error) {
    console.error("Error archiving task:", error);

    return NextResponse.json(
      { error: "Failed to archive task" },
      { status: 500 }
    );
  }
}