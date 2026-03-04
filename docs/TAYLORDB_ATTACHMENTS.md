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

## Receiving Files via tRPC 11 Multipart FormData

tRPC 11 supports `multipart/form-data` natively using `z.instanceof(FormData)` as the procedure input. File objects arrive directly in the mutation — no separate upload endpoint needed.

**Server (tRPC router):**

```typescript
import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const myRouter = router({
  submit: publicProcedure
    .input(z.instanceof(FormData))
    .mutation(async ({ input, ctx }) => {
      const name = input.get("name") as string | null;
      const files = input.getAll("files") as File[];

      // Upload files directly to TaylorDB
      const attachments = await ctx.queryBuilder.uploadAttachments(
        files.map((file) => ({ file, name: file.name }))
      );

      await ctx.queryBuilder
        .insertInto("submissions")
        .values({ name, documents: attachments })
        .execute();
    }),
});
```

**Client (tRPC React Query):**

FormData mutations must bypass request batching. Use `splitLink` in your tRPC client setup:

```typescript
import { splitLink, httpLink, httpBatchLink } from "@trpc/client";

trpc.createClient({
  links: [
    splitLink({
      condition: (op) => op.input instanceof FormData,
      true: httpLink({ url: trpcUrl }),
      false: httpBatchLink({ url: trpcUrl }),
    }),
  ],
});
```

Then call the mutation with a `FormData` object:

```typescript
const formData = new FormData();
formData.append("name", name);
files.forEach((file) => formData.append("files", file));

await submitMutation.mutateAsync(formData);
```

For more topics, see:

- `TAYLORDB_BASIC_QUERIES.md` for basic reads and filtering
- `TAYLORDB_WRITE_OPERATIONS.md` for inserts, updates, and deletes
- `TAYLORDB_ADVANCED_PATTERNS.md` for aggregations, pagination, and conditional queries
- `TAYLORDB_FIELD_TYPES.md` for field type handling and enums
- `TAYLORDB_PITFALLS_BEST_PRACTICES.md` for pitfalls and best practices

