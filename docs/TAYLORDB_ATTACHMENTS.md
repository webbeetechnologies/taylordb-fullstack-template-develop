# TaylorDB Attachments

Attachments are treated as **standard columns** and can be selected and written like other fields, using helper utilities for uploads.

This document covers:

- Selecting attachment fields
- Creating records with attachments
- Updating attachments

---

## Select Attachments

```typescript
// New Standard: Use regular .select() like any other field.
const expenses = await qb
  .selectFrom("expenses")
  .select(["id", "amount", "receipt"])
  .execute();
```

---

## Create with Attachments

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

---

## Update with Attachments

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

For more topics, see:

- `TAYLORDB_BASIC_QUERIES.md` for basic reads and filtering
- `TAYLORDB_WRITE_OPERATIONS.md` for inserts, updates, and deletes
- `TAYLORDB_ADVANCED_PATTERNS.md` for aggregations, pagination, and conditional queries
- `TAYLORDB_FIELD_TYPES.md` for field type handling and enums
- `TAYLORDB_PITFALLS_BEST_PRACTICES.md` for pitfalls and best practices

