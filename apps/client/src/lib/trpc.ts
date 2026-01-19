import { createTRPCReact, type CreateTRPCReact } from "@trpc/react-query";
import { httpBatchLink, type TRPCClient } from "@trpc/client";
import type { AppRouter } from "@repo/server/router";

/**
 * Create tRPC React hooks
 */
export const trpc: CreateTRPCReact<AppRouter, unknown> =
  createTRPCReact<AppRouter>();

/**
 * Get the base URL for tRPC requests
 */
const BASE_URL =
  (typeof globalThis.process !== "undefined" &&
    globalThis.process.env?.VITE_TRPC_URL) ||
  import.meta.env.VITE_TRPC_URL ||
  "http://localhost:3001/api";

/**
 * Create tRPC client
 */
export const trpcClient: TRPCClient<AppRouter> = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${BASE_URL}/trpc`,
      // Optional: add headers, credentials, etc.
      // headers() {
      //   return {
      //     authorization: getAuthToken(),
      //   };
      // },
    }),
  ],
});
