import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/resolve": "http://localhost:3002",
      "/words": "http://localhost:3002",
      "/search": "http://localhost:3002",
      "/claim": "http://localhost:3002",
      "/repos": "http://localhost:3002",
      "/repo": "http://localhost:3002",
      "/v1/voice": "http://localhost:3003",
    },
  },
});