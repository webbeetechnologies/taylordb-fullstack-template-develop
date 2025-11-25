import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [".develop.taylordb.ai", "localhost", "127.0.0.1"],
    host: "0.0.0.0", // Listen on all network interfaces
  },
});
