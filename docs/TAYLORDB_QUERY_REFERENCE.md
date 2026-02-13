# TaylorDB Query Builder Reference

This is the **entry point** for all TaylorDB query builder docs in this template.  
The content has been split into smaller, focused files to make it easier for agents (and humans) to scan and reuse.

---

## 📚 Topics

- **Basic Reads & Filtering**  
  See `TAYLORDB_BASIC_QUERIES.md` for:
  - Basic `selectFrom` usage
  - Ordering
  - `where` clauses
  - Date filters
  - Array/select field filters
  - Text search (`contains`)

- **Write Operations (Insert, Update, Delete)**  
  See `TAYLORDB_WRITE_OPERATIONS.md` for:
  - Inserting records (including single-/multi-select fields)
  - Updates (single/multiple fields, conditional updates)
  - Bulk updates
  - Deleting single/multiple records and conditional deletes

- **Advanced Patterns**  
  See `TAYLORDB_ADVANCED_PATTERNS.md` for:
  - Manual aggregations
  - Summation helpers
  - Conditional query builders
  - Pagination patterns

- **Field Types & Enums**  
  See `TAYLORDB_FIELD_TYPES.md` for:
  - TaylorDB field type → TypeScript mappings
  - Nullable field handling
  - Using generated enum options (`...Options`) types

- **Attachments**  
  See `TAYLORDB_ATTACHMENTS.md` for:
  - Selecting attachment fields
  - Creating/updating records with attachments via `uploadAttachments`

- **Pitfalls & Best Practices**  
  See `TAYLORDB_PITFALLS_BEST_PRACTICES.md` for:
  - Common mistakes (e.g., forgetting `["exactDay", date]`, misusing `execute`)
  - Recommended patterns for safe, type-accurate queries

---

## How Agents Should Use These Docs

1. **Start from your use case**  
   - Need a simple read? Open `TAYLORDB_BASIC_QUERIES.md`.
   - Doing writes? Use `TAYLORDB_WRITE_OPERATIONS.md`.
   - Need aggregations or pagination? Use `TAYLORDB_ADVANCED_PATTERNS.md`.

2. **Combine with generated types**  
   Always cross-reference:
   - `apps/server/taylordb/types.ts` (schema-derived types)
   - `apps/server/taylordb/query-builder.ts` (project-specific query functions)

3. **Check pitfalls before finalizing**  
   Before shipping queries, skim `TAYLORDB_PITFALLS_BEST_PRACTICES.md` to avoid common errors.

---

## Additional Resources

- **Generated Types**: `apps/server/taylordb/types.ts`
- **Example Queries in This Template**: `apps/server/taylordb/query-builder.ts`
- **tRPC Integration**: `apps/server/router.ts`

---

**Note**: These docs mirror the TaylorDB query builder patterns used in this template.  
For the most up-to-date API details, always refer to the official TaylorDB documentation.

