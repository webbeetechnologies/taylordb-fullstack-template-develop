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
function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Browser: use relative URL or environment variable
    return import.meta.env.VITE_TRPC_URL || "http://localhost:3001";
  }
  // SSR: assume localhost
  return "http://localhost:3001";
}

/**
 * Create tRPC client
 */
export const trpcClient: TRPCClient<AppRouter> = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      // Optional: add headers, credentials, etc.
      // headers() {
      //   return {
      //     authorization: getAuthToken(),
      //   };
      // },
    }),
  ],
});
