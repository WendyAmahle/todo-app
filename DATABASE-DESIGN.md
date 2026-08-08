# Database Design

## Overview

The Todo application uses SQLite to persist task data locally. The database is stored in `data/todos.db`.

The database contains one table, `tasks`. No user table is required because the application is local-first and does not implement user accounts.

The database schema is also provided in `database/schema.sql`.

## Tasks Table

The `tasks` table contains the following columns:

| Column        | Type    | Constraints               | Description                              |
| ------------- | ------- | ------------------------- | ---------------------------------------- |
| `id`          | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier for a task             |
| `title`       | TEXT    | NOT NULL                  | Task title                               |
| `description` | TEXT    | NOT NULL                  | Task description                         |
| `due_date`    | TEXT    | NOT NULL                  | Task due date                            |
| `topic`       | TEXT    | NOT NULL                  | Topic associated with the task           |
| `status`      | TEXT    | NOT NULL, CHECK           | Task status                              |
| `archived_at` | TEXT    | NULL                      | Timestamp at which the task was archived |
| `created_at`  | TEXT    | NOT NULL                  | Creation timestamp                       |
| `updated_at`  | TEXT    | NOT NULL                  | Last modification timestamp              |

## Status

A task can have one of three statuses:

* `Todo`
* `In-Progress`
* `Complete`

The database uses a `CHECK` constraint to prevent invalid status values:

```sql
CHECK (
  status IN ('Todo', 'In-Progress', 'Complete')
)
```

The API also validates the status before creating or updating a task.

## Archiving

Tasks are not deleted when the user archives them.

Instead, the application stores the current timestamp in `archived_at`.

An active task has:

```text
archived_at = NULL
```

An archived task has a timestamp in `archived_at`.

Active tasks are retrieved using:

```sql
WHERE archived_at IS NULL
```

This means an archived task remains in the database and can still be retrieved.

## Overdue Tasks

Overdue is not stored as a database column and is not treated as a task status.

Instead, it is derived from the existing task information.

A task is considered overdue when:

* its due date has passed, and
* its status is not `Complete`.

This avoids introducing an additional status such as `Overdue` and ensures that the overdue state can change automatically as time passes.

## Relationships

There are no foreign-key relationships in the database.

The application is designed as a local-first, single-user todo application and does not have accounts or other entities that tasks need to reference.

Therefore, the database currently consists of the single `tasks` table.

## Persistence

The SQLite database is stored locally in:

```text
data/todos.db
```

The application creates the database directory when required and creates the `tasks` table if it does not already exist.

Because task information is stored in SQLite rather than application memory, tasks remain available after the application is stopped and restarted.
