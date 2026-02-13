# TaylorDB Query Builder Reference

This document provides comprehensive examples of how to use the TaylorDB query builder for all common database operations.

---

## 📚 Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [Basic Queries](#basic-queries)
3. [Filtering & Conditions](#filtering--conditions)
4. [Inserting Data](#inserting-data)
5. [Updating Data](#updating-data)
6. [Deleting Data](#deleting-data)
7. [Advanced Patterns](#advanced-patterns)
8. [Field Type Handling](#field-type-handling)
9. [Attachments](#attachments)
10. [Common Pitfalls](#common-pitfalls)

---

## Basic Queries

### Get All Records

```typescript
export async function getAllUsers() {
  return await queryBuilder
    .selectFrom("users")
    .select(["id", "name", "email", "createdAt"])
    .execute();
}
```

### Get All Records (All Fields)

```typescript
export async function getAllUsers() {
  return await queryBuilder.selectFrom("users").execute();
}
```

### Get Single Record by ID

```typescript
export async function getUserById(id: number) {
  return await queryBuilder
    .selectFrom("users")
    .where("id", "=", id)
    .executeTakeFirst();
}
```

**Note**: `.executeTakeFirst()` returns a single record or `undefined`.

### Get Records with Ordering

```typescript
// Descending order (newest first)
export async function getRecentUsers() {
  return await queryBuilder
    .selectFrom("users")
    .orderBy("createdAt", "desc")
    .execute();
}

// Ascending order (oldest first)
export async function getOldestUsers() {
  return await queryBuilder
    .selectFrom("users")
    .orderBy("createdAt", "asc")
    .execute();
}
```

---

## Filtering & Conditions

### Basic Where Clauses

```typescript
// Exact match
.where("status", "=", "active")

// Not equal
.where("status", "!=", "deleted")

// Greater than / Less than
.where("age", ">", 18)
.where("age", ">=", 18)
.where("age", "<", 65)
.where("age", "<=", 65)
```

### Multiple Conditions (AND logic)

```typescript
export async function getActiveAdults() {
  return await queryBuilder
    .selectFrom("users")
    .where("status", "=", "active")
    .where("age", ">=", 18)
    .execute();
}
```

### Date Filtering

```typescript
// Exact date
export async function getUsersForDate(date: string) {
  return await queryBuilder
    .selectFrom("users")
    .where("createdAt", "=", ["exactDay", date])
    .execute();
}

// Date range
export async function getUsersInRange(startDate: string, endDate: string) {
  return await queryBuilder
    .selectFrom("users")
    .where("createdAt", ">=", ["exactDay", startDate])
    .where("createdAt", "<=", ["exactDay", endDate])
    .execute();
}

// Before/After a date
.where("dueDate", "<", ["exactDay", "2024-01-01"])
.where("startDate", ">", ["exactDay", "2024-12-31"])
```

### Array/Multi-Select Filtering

```typescript
// Check if array contains any of the values
export async function getUsersByTags(tags: string[]) {
  return await queryBuilder
    .selectFrom("users")
    .where("tags", "hasAnyOf", tags)
    .execute();
}

// Example: Get users tagged with "admin" OR "moderator"
const adminUsers = await getUsersByTags(["admin", "moderator"]);
```

### Select Field Filtering

#### Single Select

For single-select fields, the query builder now returns a single string value.

```typescript
export async function getUsersByRole(role: string) {
  return await queryBuilder
    .selectFrom("users")
    .where("role", "=", role)
    .execute();
}
```

#### Multi Select

For multi-select fields, the query builder returns and accepts multiple values.

```typescript
export async function getUsersByInterests(interests: string[]) {
  return await queryBuilder
    .selectFrom("users")
    .where("interests", "hasAnyOf", interests)
    .execute();
}
```

### Text Search (Contains)

```typescript
export async function searchUsersByName(query: string) {
  return await queryBuilder
    .selectFrom("users")
    .where("name", "contains", query)
    .execute();
}
```

---

## Inserting Data

### Insert Single Record

```typescript
export async function createUser(data: {
  name: string;
  email: string;
  age: number;
}) {
  return await queryBuilder
    .insertInto("users")
    .values({
      name: data.name,
      email: data.email,
      age: data.age,
      status: "active", // Default value
    })
    .executeTakeFirst();
}
```

**Returns**: The created record with its generated `id`.

### Insert with Single-Select Field

Single-select fields now accept a single string value directly.

```typescript
export async function createTask(data: {
  title: string;
  priority: "low" | "medium" | "high";
}) {
  return await queryBuilder
    .insertInto("tasks")
    .values({
      title: data.title,
      priority: data.priority,
    })
    .executeTakeFirst();
}
```

### Insert with Multi-Select Field

```typescript
export async function createProject(data: { name: string; tags: string[] }) {
  return await queryBuilder
    .insertInto("projects")
    .values({
      name: data.name,
      tags: data.tags, // Already an array
    })
    .executeTakeFirst();
}
```

### Insert with Computed Fields

```typescript
export async function createCardioSession(data: {
  distance: number;
  duration: number; // in minutes
}) {
  const speed = data.distance / (data.duration / 60); // km/h

  return await queryBuilder
    .insertInto("cardio")
    .values({
      distance: data.distance,
      duration: data.duration,
      speed: speed, // Computed field
    })
    .executeTakeFirst();
}
```

### Insert with Optional Fields

```typescript
export async function createPost(data: {
  title: string;
  content: string;
  tags?: string[];
}) {
  return await queryBuilder
    .insertInto("posts")
    .values({
      title: data.title,
      content: data.content,
      tags: data.tags || [], // Default to empty array
    })
    .executeTakeFirst();
}
```

---

## Updating Data

### Update Single Field

```typescript
export async function updateUserName(id: number, name: string) {
  return await queryBuilder
    .update("users")
    .set({ name })
    .where("id", "=", id)
    .execute();
}
```

### Update Multiple Fields

```typescript
export async function updateUser(
  id: number,
  data: {
    name?: string;
    email?: string;
    age?: number;
  },
) {
  return await queryBuilder
    .update("users")
    .set(data)
    .where("id", "=", id)
    .execute();
}
```

**Note**: Only provided fields will be updated.

### Update with Single-Select Field

```typescript
export async function updateTaskPriority(
  id: number,
  priority: "low" | "medium" | "high",
) {
  return await queryBuilder
    .update("tasks")
    .set({ priority })
    .where("id", "=", id)
    .execute();
}
```

### Update with Conditional Logic

```typescript
export async function updateCardioSession(
  id: number,
  data: {
    distance?: number;
    duration?: number;
  },
) {
  // Fetch current record to compute speed
  const currentRecord = await queryBuilder
    .selectFrom("cardio")
    .select(["distance", "duration"])
    .where("id", "=", id)
    .executeTakeFirst();

  if (!currentRecord) {
    throw new Error("Record not found");
  }

  const newDistance = data.distance ?? currentRecord.distance ?? 0;
  const newDuration = data.duration ?? currentRecord.duration ?? 0;
  const speed = newDistance / (newDuration / 60);

  return await queryBuilder
    .update("cardio")
    .set({
      ...data,
      speed,
    })
    .where("id", "=", id)
    .execute();
}
```

### Update Multiple Records

```typescript
export async function activateAllUsers() {
  return await queryBuilder.update("users").set({ status: "active" }).execute(); // No where clause = update all
}

// Update with condition
export async function activateInactiveUsers() {
  return await queryBuilder
    .update("users")
    .set({ status: "active" })
    .where("status", "=", "inactive")
    .execute();
}
```

---

## Deleting Data

### Delete Single Record

```typescript
export async function deleteUser(id: number) {
  return await queryBuilder.deleteFrom("users").where("id", "=", id).execute();
}
```

### Delete Multiple Records by IDs

```typescript
export async function deleteUsers(ids: number[]) {
  return await queryBuilder
    .deleteFrom("users")
    .where("id", "hasAnyOf", ids)
    .execute();
}
```

### Delete with Condition

```typescript
export async function deleteInactiveUsers() {
  return await queryBuilder
    .deleteFrom("users")
    .where("status", "=", "inactive")
    .execute();
}
```

### Delete Old Records

```typescript
export async function deleteOldLogs(beforeDate: string) {
  return await queryBuilder
    .deleteFrom("logs")
    .where("createdAt", "<", ["exactDay", beforeDate])
    .execute();
}
```

---

## Advanced Patterns

### Aggregations (Manual)

Since TaylorDB query builder might not have built-in aggregations, compute manually:

```typescript
export async function getUserStats() {
  const users = await queryBuilder
    .selectFrom("users")
    .select(["age"])
    .execute();

  if (users.length === 0) {
    return { count: 0, average: null, min: null, max: null };
  }

  const ages = users
    .map((u) => u.age)
    .filter((a): a is number => a !== undefined);

  return {
    count: ages.length,
    average: ages.reduce((a, b) => a + b, 0) / ages.length,
    min: Math.min(...ages),
    max: Math.max(...ages),
  };
}
```

### Sum Totals

```typescript
export async function getTotalCaloriesForDate(date: string) {
  const entries = await queryBuilder
    .selectFrom("meals")
    .select(["calories", "protein", "carbs", "fats"])
    .where("date", "=", ["exactDay", date])
    .execute();

  return {
    totalCalories: entries.reduce((sum, e) => sum + (e.calories ?? 0), 0),
    totalProtein: entries.reduce((sum, e) => sum + (e.protein ?? 0), 0),
    totalCarbs: entries.reduce((sum, e) => sum + (e.carbs ?? 0), 0),
    totalFats: entries.reduce((sum, e) => sum + (e.fats ?? 0), 0),
  };
}
```

### Conditional Queries

```typescript
export async function searchTasks(filters: {
  projectId?: number;
  status?: string;
  dueAfter?: string;
}) {
  let query = queryBuilder
    .selectFrom("tasks")
    .select(["id", "title", "status", "dueDate"]);

  if (filters.projectId) {
    query = query.where("projectId", "=", filters.projectId);
  }

  if (filters.status) {
    query = query.where("status", "=", filters.status);
  }

  if (filters.dueAfter) {
    query = query.where("dueDate", ">=", ["exactDay", filters.dueAfter]);
  }

  return await query.execute();
}
```

### Pagination

```typescript
export async function getPaginatedUsers(page: number, pageSize: number) {
  const offset = (page - 1) * pageSize;

  return await queryBuilder
    .selectFrom("users")
    .select(["id", "name", "email"])
    .orderBy("createdAt", "desc")
    .limit(pageSize)
    .offset(offset)
    .execute();
}
```

---

## Field Type Handling

### Field Type Reference

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

### Handling Nullable Fields

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

### Working with Enums

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

## Common Pitfalls

### ❌ Pitfall 2: Not Using exactDay for Dates

```typescript
// ❌ WRONG
.where("date", "=", "2024-01-15")

// ✅ CORRECT
.where("date", "=", ["exactDay", "2024-01-15"])
```

### ❌ Pitfall 3: Ignoring Nullable Fields

```typescript
// ❌ WRONG (assumes field is always present)
const user = await queryBuilder
  .selectFrom("users")
  .where("id", "=", 1)
  .executeTakeFirst();
console.log(user.email); // Could be undefined!

// ✅ CORRECT
const user = await queryBuilder
  .selectFrom("users")
  .where("id", "=", 1)
  .executeTakeFirst();
if (user && user.email) {
  console.log(user.email);
}
```

### ❌ Pitfall 4: Using execute() for Single Record

```typescript
// ❌ WRONG (returns array)
const user = await queryBuilder
  .selectFrom("users")
  .where("id", "=", 1)
  .execute();
console.log(user.name); // Error: user is an array!

// ✅ CORRECT
const user = await queryBuilder
  .selectFrom("users")
  .where("id", "=", 1)
  .executeTakeFirst();
if (user) {
  console.log(user.name);
}
```

### ❌ Pitfall 5: Not Handling Empty Arrays

```typescript
// ❌ WRONG (fails if users is empty)
const ages = users.map((u) => u.age);
const avg = ages.reduce((a, b) => a + b) / ages.length; // Division by zero!

// ✅ CORRECT
if (users.length === 0) {
  return { average: null };
}
const ages = users
  .map((u) => u.age)
  .filter((a): a is number => a !== undefined);
const avg = ages.reduce((a, b) => a + b, 0) / ages.length;
```

---

## Best Practices

1. **Always handle `undefined` and `null`** when working with query results
2. **Use TypeScript types** from `taylordb/types.ts` for type safety
3. **Wrap single-select values** in arrays when inserting/updating
4. **Use `executeTakeFirst()`** when you expect a single record
5. **Filter nullish values** before aggregations
6. **Provide defaults** for optional fields
7. **Use `exactDay`** format for date comparisons
8. **Group related queries** in the same function file
9. **Export functions**, not raw queries
10. **Document complex queries** with JSDoc comments

---

## Attachments

Attachments are no longer treated as relations. They are now standard columns and can be selected directly.

### Select Attachments

```typescript
// New Standard: Use regular .select() like any other field.
const expenses = await qb
  .selectFrom("expenses")
  .select(["id", "amount", "receipt"])
  .execute();
```

### Create with Attachments

Use `qb.uploadAttachments` to upload files before inserting.

```typescript
await qb
  .insertInto("customers")
  .values({
    firstName: "Jane",
    lastName: "Doe",
    avatar: await qb.uploadAttachments([
      { file: new Blob([""]), name: "test.png" },
    ]),
  })
  .execute();
```

### Update with Attachments

```typescript
await qb
  .update("customers")
  .set({
    lastName: "Smith",
    avatar: await qb.uploadAttachments([
      { file: new Blob([""]), name: "test.png" },
    ]),
  })
  .where("id", "=", 1)
  .execute();
```

---

## Additional Resources

- **Generated Types**: Check `apps/server/taylordb/types.ts` for your schema
- **Example Queries**: See `apps/server/taylordb/query-builder.ts`
- **tRPC Integration**: See `apps/server/router.ts`

---

**Note**: This reference is based on the TaylorDB query builder patterns used in this template. Always refer to the official TaylorDB documentation for the most up-to-date API details.
