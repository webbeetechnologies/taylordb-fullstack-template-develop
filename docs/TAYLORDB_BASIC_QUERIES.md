# TaylorDB Basic Queries & Filtering

This document covers **core read operations** using the TaylorDB query builder:

- **Basic select queries**
- **Ordering**
- **Filtering with where clauses**
- **Date filters**
- **Array and select field filters**
- **Simple text search**

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

For more topics, see:

- `TAYLORDB_WRITE_OPERATIONS.md` for inserts, updates, and deletes
- `TAYLORDB_ADVANCED_PATTERNS.md` for aggregations, pagination, and conditional queries
- `TAYLORDB_FIELD_TYPES.md` for field type handling and enums
- `TAYLORDB_PITFALLS_BEST_PRACTICES.md` for pitfalls and best practices

