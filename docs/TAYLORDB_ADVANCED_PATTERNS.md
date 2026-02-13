# TaylorDB Advanced Patterns

This document covers **advanced query patterns** using the TaylorDB query builder:

- Manual aggregations
- Summation helpers
- Conditional queries
- Pagination

---

## Aggregations (Manual)

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

---

## Sum Totals

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

---

## Conditional Queries

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

---

## Pagination

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

For more topics, see:

- `TAYLORDB_BASIC_QUERIES.md` for basic reads and filtering
- `TAYLORDB_WRITE_OPERATIONS.md` for inserts, updates, and deletes
- `TAYLORDB_FIELD_TYPES.md` for field type handling and enums
- `TAYLORDB_PITFALLS_BEST_PRACTICES.md` for pitfalls and best practices

