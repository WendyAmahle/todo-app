import { NextRequest, NextResponse } from "next/server";
import { createTask, getTasks, TaskStatus } from "@/lib/tasks";

const validStatuses: TaskStatus[] = [
  "Todo",
  "In-Progress",
  "Complete",
];

export async function GET(request: NextRequest) {
  try {
    const includeArchived =
      request.nextUrl.searchParams.get("includeArchived") === "true";

    const tasks = getTasks(includeArchived);

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);

    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const task = createTask(
      title,
      description,
      dueDate,
      topic,
      status
    );

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);

    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}