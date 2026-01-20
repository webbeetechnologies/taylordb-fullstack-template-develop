import { createQueryBuilder } from "@taylordb/query-builder";
import type { TaylorDatabase } from "./types.js";

/**
 * TaylorDB Query Builder Instance
 *
 * This is the main query builder instance configured with your TaylorDB credentials.
 * Use this to perform all database operations in a type-safe manner.
 */
export const queryBuilder = createQueryBuilder<TaylorDatabase>({
  baseUrl: process.env.TAYLORDB_BASE_URL!,
  baseId: process.env.TAYLORDB_SERVER_ID!,
  apiKey: process.env.TAYLORDB_API_TOKEN!,
});

/**
 * ============================================================================
 * Example Query Functions
 * ============================================================================
 *
 * Below are example patterns for common database operations.
 * Replace these with your own functions based on your actual schema.
 *
 * For comprehensive examples, see: /docs/TAYLORDB_QUERY_REFERENCE.md
 */

// ============================================================================
// READ Operations (Queries)
// ============================================================================

/**
 * Example: Get all records from a table
 *
 * @example
 * export async function getAllUsers() {
 *   return await queryBuilder
 *     .selectFrom("users")
 *     .select(["id", "name", "email", "createdAt"])
 *     .orderBy("createdAt", "desc")
 *     .execute();
 * }
 */

/**
 * Example: Get a single record by ID
 *
 * @example
 * export async function getUserById(id: number) {
 *   return await queryBuilder
 *     .selectFrom("users")
 *     .where("id", "=", id)
 *     .executeTakeFirst();
 * }
 */

/**
 * Example: Get records with filtering
 *
 * @example
 * export async function getActiveUsers() {
 *   return await queryBuilder
 *     .selectFrom("users")
 *     .where("status", "=", "active")
 *     .orderBy("name", "asc")
 *     .execute();
 * }
 */

/**
 * Example: Get records with date range filtering
 *
 * @example
 * export async function getRecordsInDateRange(startDate: string, endDate: string) {
 *   return await queryBuilder
 *     .selectFrom("records")
 *     .where("date", ">=", ["exactDay", startDate])
 *     .where("date", "<=", ["exactDay", endDate])
 *     .orderBy("date", "asc")
 *     .execute();
 * }
 */

// ============================================================================
// CREATE Operations (Insert)
// ============================================================================

/**
 * Example: Insert a new record
 *
 * @example
 * export async function createUser(data: { name: string; email: string }) {
 *   return await queryBuilder
 *     .insertInto("users")
 *     .values({
 *       name: data.name,
 *       email: data.email,
 *       status: "active",
 *     })
 *     .executeTakeFirst();
 * }
 */

/**
 * Example: Insert with single-select field
 *
 * Note: Single-select fields must be wrapped in an array
 *
 * @example
 * export async function createTask(data: { title: string; priority: "low" | "medium" | "high" }) {
 *   return await queryBuilder
 *     .insertInto("tasks")
 *     .values({
 *       title: data.title,
 *       priority: [data.priority], // Wrap in array for single-select
 *     })
 *     .executeTakeFirst();
 * }
 */

/**
 * Example: Insert with computed fields
 *
 * @example
 * export async function createOrder(data: { quantity: number; pricePerUnit: number }) {
 *   const totalPrice = data.quantity * data.pricePerUnit;
 *
 *   return await queryBuilder
 *     .insertInto("orders")
 *     .values({
 *       quantity: data.quantity,
 *       pricePerUnit: data.pricePerUnit,
 *       totalPrice: totalPrice,
 *     })
 *     .executeTakeFirst();
 * }
 */

// ============================================================================
// UPDATE Operations
// ============================================================================

/**
 * Example: Update a record
 *
 * @example
 * export async function updateUser(id: number, data: { name?: string; email?: string }) {
 *   return await queryBuilder
 *     .update("users")
 *     .set(data)
 *     .where("id", "=", id)
 *     .execute();
 * }
 */

/**
 * Example: Update with conditional recalculation
 *
 * @example
 * export async function updateOrder(id: number, data: { quantity?: number; pricePerUnit?: number }) {
 *   // Fetch current record to compute total
 *   const currentOrder = await queryBuilder
 *     .selectFrom("orders")
 *     .select(["quantity", "pricePerUnit"])
 *     .where("id", "=", id)
 *     .executeTakeFirst();
 *
 *   if (!currentOrder) {
 *     throw new Error("Order not found");
 *   }
 *
 *   const newQuantity = data.quantity ?? currentOrder.quantity ?? 0;
 *   const newPrice = data.pricePerUnit ?? currentOrder.pricePerUnit ?? 0;
 *   const totalPrice = newQuantity * newPrice;
 *
 *   return await queryBuilder
 *     .update("orders")
 *     .set({
 *       ...data,
 *       totalPrice,
 *     })
 *     .where("id", "=", id)
 *     .execute();
 * }
 */

// ============================================================================
// DELETE Operations
// ============================================================================

/**
 * Example: Delete a single record
 *
 * @example
 * export async function deleteUser(id: number) {
 *   return await queryBuilder
 *     .deleteFrom("users")
 *     .where("id", "=", id)
 *     .execute();
 * }
 */

/**
 * Example: Delete multiple records by IDs
 *
 * @example
 * export async function deleteUsers(ids: number[]) {
 *   return await queryBuilder
 *     .deleteFrom("users")
 *     .where("id", "hasAnyOf", ids)
 *     .execute();
 * }
 */

/**
 * Example: Delete with condition
 *
 * @example
 * export async function deleteInactiveUsers() {
 *   return await queryBuilder
 *     .deleteFrom("users")
 *     .where("status", "=", "inactive")
 *     .execute();
 * }
 */

// ============================================================================
// AGGREGATION Operations (Manual)
// ============================================================================

/**
 * Example: Calculate statistics
 *
 * @example
 * export async function getUserStats() {
 *   const users = await queryBuilder
 *     .selectFrom("users")
 *     .select(["age"])
 *     .execute();
 *
 *   if (users.length === 0) {
 *     return { count: 0, average: null, min: null, max: null };
 *   }
 *
 *   const ages = users.map(u => u.age).filter((a): a is number => a !== undefined);
 *
 *   return {
 *     count: ages.length,
 *     average: ages.reduce((a, b) => a + b, 0) / ages.length,
 *     min: Math.min(...ages),
 *     max: Math.max(...ages),
 *   };
 * }
 */

/**
 * Example: Sum totals for a date
 *
 * @example
 * export async function getTotalSalesForDate(date: string) {
 *   const sales = await queryBuilder
 *     .selectFrom("sales")
 *     .select(["amount", "quantity"])
 *     .where("date", "=", ["exactDay", date])
 *     .execute();
 *
 *   return {
 *     totalAmount: sales.reduce((sum, s) => sum + (s.amount ?? 0), 0),
 *     totalQuantity: sales.reduce((sum, s) => sum + (s.quantity ?? 0), 0),
 *   };
 * }
 */

/**
 * ============================================================================
 * Query Builder Quick Reference
 * ============================================================================
 *
 * SELECT:
 * - .selectFrom("tableName")
 * - .select(["field1", "field2"])
 * - .execute() // Returns array
 * - .executeTakeFirst() // Returns single record or undefined
 *
 * WHERE:
 * - .where("field", "=", value)
 * - .where("field", ">", value)
 * - .where("field", "hasAnyOf", [value1, value2])
 * - .where("date", ">=", ["exactDay", "2024-01-01"])
 *
 * ORDER BY:
 * - .orderBy("field", "asc")
 * - .orderBy("field", "desc")
 *
 * INSERT:
 * - .insertInto("tableName")
 * - .values({ field1: value1, field2: value2 })
 * - .executeTakeFirst()
 *
 * UPDATE:
 * - .update("tableName")
 * - .set({ field1: value1 })
 * - .where("id", "=", id)
 * - .execute()
 *
 * DELETE:
 * - .deleteFrom("tableName")
 * - .where("id", "=", id)
 * - .execute()
 *
 * Field Types:
 * - Text: string
 * - Number: number
 * - Date: ["exactDay", "YYYY-MM-DD"]
 * - Single Select: ["option"]
 * - Multi Select: ["opt1", "opt2"]
 * - Boolean: true/false
 *
 * For comprehensive examples, see: /docs/TAYLORDB_QUERY_REFERENCE.md
 */
