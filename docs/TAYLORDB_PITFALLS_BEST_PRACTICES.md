# TaylorDB Pitfalls & Best Practices

This document captures **common mistakes** and **recommended patterns** when using the TaylorDB query builder.

---

## Common Pitfalls

### ❌ Pitfall: Not Using exactDay for Dates

```typescript
// ❌ WRONG
.where("date", "=", "2024-01-15")

// ✅ CORRECT
.where("date", "=", ["exactDay", "2024-01-15"])
```

### ❌ Pitfall: Ignoring Nullable Fields

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

### ❌ Pitfall: Using execute() for Single Record

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

### ❌ Pitfall: Not Handling Empty Arrays

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

1. **Always handle `undefined` and `null`** when working with query results.
2. **Use TypeScript types** from `taylordb/types.ts` for type safety.
3. **Use `executeTakeFirst()`** when you expect a single record.
4. **Filter nullish values** before aggregations.
5. **Provide defaults** for optional fields.
6. **Use `["exactDay", date]`** format for date comparisons.
7. **Group related queries** in the same function file.
8. **Export functions**, not raw queries.
9. **Document complex queries** with JSDoc comments.

---

For more topics, see:

- `TAYLORDB_BASIC_QUERIES.md` for basic reads and filtering
- `TAYLORDB_WRITE_OPERATIONS.md` for inserts, updates, and deletes
- `TAYLORDB_ADVANCED_PATTERNS.md` for aggregations, pagination, and conditional queries
- `TAYLORDB_FIELD_TYPES.md` for field type handling and enums

