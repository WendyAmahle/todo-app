# Todo Application

A local-first todo application built with Next.js and SQLite for COMS3011A Lab 1.

The application runs locally on a single user's machine. Tasks are persisted in a local SQLite database and remain available after the application is restarted.

---

## Third-Party Code

The following third-party libraries and packages are used by the application.

### Runtime dependencies

**Next.js 16.2.12**
Next.js is used as the application's web framework. It provides the application structure, routing, and API route functionality required by the project.

**React 19.2.4**
React is used to build the user interface from reusable components and to manage the application's interactive state.

**React DOM 19.2.4**
React DOM connects the React application to the browser's DOM so that the user interface can be rendered and updated.

**SQLite3 6.0.1**
SQLite3 provides the application's persistent local database. It was chosen because the assignment requires SQLite and because SQLite stores the application's task data locally without requiring a separate database server.

### Development dependencies

**TypeScript 5**
TypeScript is used to provide static type checking for the application's TypeScript code.

**Vitest 4.1.10**
Vitest is used to run the automated behavioural tests. It was chosen because it provides a simple test runner that can execute the database tests through a single documented command.

**ESLint 9**
ESLint is used to identify potential problems and maintain consistent code quality.

**eslint-config-next 16.2.12**
This provides ESLint rules and configuration appropriate for a Next.js application.

**Tailwind CSS 4**
Tailwind CSS is included for styling the application's interface.

**@tailwindcss/postcss 4**
This provides the PostCSS integration required for Tailwind CSS.

**@types/node**
Provides TypeScript type definitions for Node.js APIs used by the application.

**@types/react**
Provides TypeScript type definitions for React.

**@types/react-dom**
Provides TypeScript type definitions for React DOM.

---

## Database Design

The application uses SQLite for persistent local storage.

The database is stored in:

```text
data/todos.db
```

The database schema is also provided separately in:

```text
database/schema.sql
```

The application contains one database table:

```text
tasks
```

There are no user tables because this is a single-user, local-first application and the assignment does not require user accounts. Consequently, the database does not require foreign-key relationships between users and tasks.

### Tasks table

| Column        | Type    | Constraints                | Purpose                                         |
| ------------- | ------- | -------------------------- | ----------------------------------------------- |
| `id`          | INTEGER | PRIMARY KEY AUTOINCREMENT  | Unique identifier for each task                 |
| `title`       | TEXT    | NOT NULL                   | Task title                                      |
| `description` | TEXT    | NOT NULL                   | Detailed description of the task                |
| `due_date`    | TEXT    | NOT NULL                   | Date by which the task is due                   |
| `topic`       | TEXT    | NOT NULL                   | Topic/category associated with the task         |
| `status`      | TEXT    | NOT NULL, CHECK constraint | Current task status                             |
| `archived_at` | TEXT    | NULL allowed               | Timestamp indicating when the task was archived |
| `created_at`  | TEXT    | NOT NULL                   | Timestamp when the task was created             |
| `updated_at`  | TEXT    | NOT NULL                   | Timestamp when the task was last changed        |

### Status

Each task has exactly one of three statuses:

* `Todo`
* `In-Progress`
* `Complete`

The database enforces these values using a `CHECK` constraint:

```sql
CHECK (
  status IN ('Todo', 'In-Progress', 'Complete')
)
```

The same three values are also enforced by the application's TypeScript types and API validation.

### Archiving

Tasks are never deleted from the database.

Instead, the `archived_at` column is initially `NULL`. When a task is archived, the application stores the archive timestamp in this column.

Active tasks are retrieved using:

```sql
WHERE archived_at IS NULL
```

Archived tasks therefore leave the active task list while remaining stored in SQLite and available for viewing.

### Overdue tasks

Overdue is deliberately **not stored as a database column or as a task status**.

The three allowed statuses remain:

```text
Todo
In-Progress
Complete
```

An overdue indication is derived from the task's `due_date` and `status` when the task is displayed.

A task is considered overdue when its due date has passed and its status is not `Complete`.

This means that overdue information is calculated from the stored task data rather than becoming a fourth status or an additional persisted field.

### Persistence

The SQLite database is created automatically when the application starts. The application uses the `tasks` table to store task information.

Because the data is stored in `data/todos.db`, stopping and restarting the Next.js application does not remove the tasks.

---

## Testing

The repository contains four automated behavioural tests.

The tests cover:

1. Creating and retrieving a task.
2. Updating an existing task.
3. Archiving a task without deleting it.
4. The overdue rule.

The tests use a temporary SQLite database rather than the application's normal `data/todos.db`. This prevents the tests from depending on or modifying the developer's personal task data.

Run all tests with:

```text
npm test
```

The current test suite contains four tests, all of which pass.

---

## Running It

### Requirements

The application was developed and tested with:

```text
Node.js v24.14.1
```

npm is included with Node.js.

The application is intended to run locally and does not require a deployed web server or separate database server.

### 1. Clone the repository

Clone the GitHub repository and enter the project directory:

```powershell
git clone <REPOSITORY_URL>
cd todo-app
```

Replace `<REPOSITORY_URL>` with the repository URL provided for the submission.

### 2. Install dependencies

From the project directory, run:

```powershell
npm install
```

This installs the dependencies specified in `package.json`.

### 3. Start the application

Run:

```powershell
npm run dev
```

Next.js will start the local development server.

Open the address shown in the terminal, normally:

```text
http://localhost:3000
```

### 4. Run the tests

The complete automated test suite can be run with:

```powershell
npm test
```

The command runs all Vitest tests in the repository.

### 5. Database

No separate database installation or database server is required.

When the application starts, SQLite creates the local database at:

```text
data/todos.db
```

The application creates the required `tasks` table automatically if it does not already exist.

---

## Project Structure

The main project directories are:

```text
todo-app/
├── app/
│   ├── api/
│   │   └── tasks/
│   └── page.tsx
├── database/
│   └── schema.sql
├── data/
│   └── todos.db
├── lib/
│   ├── db.ts
│   └── tasks.ts
├── tests/
│   └── tasks.test.ts
├── package.json
└── README.md
```

The `app` directory contains the user interface and API routes, `lib` contains the database and task logic, `database/schema.sql` documents the database schema, and `tests` contains the automated behavioural tests.
