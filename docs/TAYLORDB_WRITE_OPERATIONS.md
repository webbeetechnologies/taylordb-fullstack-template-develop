# TaylorDB Write Operations (Insert, Update, Delete)

This document covers **write operations** using the TaylorDB query builder:

- **Inserting data**
- **Updating single/multiple records**
- **Deleting records**

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

For more topics, see:

- `TAYLORDB_BASIC_QUERIES.md` for basic reads and filtering
- `TAYLORDB_ADVANCED_PATTERNS.md` for aggregations, pagination, and conditional queries
- `TAYLORDB_FIELD_TYPES.md` for field type handling and enums
- `TAYLORDB_PITFALLS_BEST_PRACTICES.md` for pitfalls and best practices

