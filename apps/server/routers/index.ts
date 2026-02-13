/**
 * Routers Index
 *
 * Re-export all sub-routers from a single entry point.
 * This keeps imports clean in the main router.ts
 */

export { usersRouter } from "./users";
export { postsRouter } from "./posts";
export { submitUserDataRouter } from "./submitUserData";
