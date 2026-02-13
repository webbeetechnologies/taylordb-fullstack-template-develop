# TaylorDB Field Types & Enums

This document explains how TaylorDB field types map to TypeScript and how to handle them correctly:

- Field type reference
- Nullable fields
- Enums and options from generated types

---

## Field Type Reference

| TaylorDB Field Type | TypeScript Type         | Insert Value          | Query Value                  |
| ------------------- | ----------------------- | --------------------- | ---------------------------- |
| **Text**            | `string`                | `"Hello"`             | `"Hello"`                    |
| **Number**          | `number`                | `42`                  | `42`                         |
| **Date**            | `string` (ISO)          | `"2024-01-15"`        | `["exactDay", "2024-01-15"]` |
| **Checkbox**        | `boolean`               | `true`                | `true`                       |
| **Single Select**   | `string`                | `"option"`            | `"option"`                   |
| **Multi Select**    | `string[]`              | `["opt1", "opt2"]`    | `["opt1", "opt2"]`           |
| **Attachment**      | `string[]` (File Paths) | `uploadAttachments()` | `"file-path"`                |
| **Email**           | `string`                | `"user@example.com"`  | `"user@example.com"`         |

---

## Handling Nullable Fields

```typescript
export async function createUserSafe(data: {
  name: string;
  email?: string | null;
  age?: number | null;
}) {
  return await queryBuilder
    .insertInto("users")
    .values({
      name: data.name,
      email: data.email ?? "", // Default to empty string
      age: data.age ?? 0, // Default to 0
    })
    .executeTakeFirst();
}
```

---

## Working with Enums

```typescript
// Import from generated types
import type { TaskStatusOptions } from "./types";

export async function createTask(data: {
  title: string;
  status: (typeof TaskStatusOptions)[number]; // e.g., "todo" | "in-progress" | "done"
}) {
  return await queryBuilder
    .insertInto("tasks")
    .values({
      title: data.title,
      status: data.status,
    })
    .executeTakeFirst();
}

export async function getTasksByStatus(
  status: (typeof TaskStatusOptions)[number],
) {
  return await queryBuilder
    .selectFrom("tasks")
    .where("status", "=", status)
    .execute();
}
```

---

For more topics, see:

- `TAYLORDB_BASIC_QUERIES.md` for basic reads and filtering
- `TAYLORDB_WRITE_OPERATIONS.md` for inserts, updates, and deletes
- `TAYLORDB_ADVANCED_PATTERNS.md` for aggregations, pagination, and conditional queries
- `TAYLORDB_PITFALLS_BEST_PRACTICES.md` for pitfalls and best practices

