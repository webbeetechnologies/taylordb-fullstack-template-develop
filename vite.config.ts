import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const allowedHosts = [".develop.taylordb.ai", "localhost", "127.0.0.1"];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "host-validation",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const host = req.headers.host?.split(":")[0];
          if (host && allowedHosts.some((allowed) => host.endsWith(allowed))) {
            return next();
          }
          res.writeHead(403, { "Content-Type": "text/plain" });
          res.end(`Forbidden host: ${host}`);
        });
      },
    },
  ],
  server: {
    host: "0.0.0.0", // Listen on all network interfaces
  },
});
