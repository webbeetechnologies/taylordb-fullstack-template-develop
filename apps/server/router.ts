import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import { usersRouter, postsRouter, submitUserDataRouter } from "./routers";

/**
 * Main tRPC Router
 *
 * This router merges all sub-routers from the routers/ directory.
 * Each domain (users, posts, etc.) has its own file for better organization.
 *
 * To add a new domain:
 * 1. Create a new file in routers/ (e.g., routers/comments.ts)
 * 2. Export the router from routers/index.ts
 * 3. Import and add it below
 */

export const appRouter = router({
  // ============================================================================
  // Sub-Routers (organized by domain)
  // ============================================================================
  users: usersRouter,
  posts: postsRouter,
  submitUserData: submitUserDataRouter,

  // ============================================================================
  // Global / Utility Procedures
  // ============================================================================
  hello: publicProcedure
    .input(
      z
        .object({
          name: z.string().optional(),
        })
        .optional()
    )
    .query(({ input }) => {
      return {
        message: `Hello ${input?.name ?? "World"}!`,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      };
    }),
});

// Export type definition of API
export type AppRouter = typeof appRouter;

/**
 * ============================================================================
 * tRPC Quick Reference
 * ============================================================================
 *
 * QUERIES (for reading data):
 * - Use .query() for operations that don't modify data
 * - Example: getAll, getById, search, etc.
 *
 * MUTATIONS (for writing data):
 * - Use .mutation() for operations that create, update, or delete data
 * - Example: create, update, delete
 *
 * INPUT VALIDATION:
 * - Use .input() with Zod schemas to validate input
 * - Example: .input(z.object({ id: z.number(), name: z.string() }))
 *
 * ACCESSING INPUT:
 * - Access validated input via { input } destructuring
 * - Example: .query(async ({ input }) => { ... })
 *
 * ORGANIZATION:
 * - Group related procedures under a namespace
 * - Example: users.getAll, users.create, posts.getAll, etc.
 *
 * ERROR HANDLING:
 * - Throw errors from procedures, tRPC will handle them
 * - Example: throw new Error("User not found");
 *
 * For comprehensive examples, see the example implementation or docs.
 */
