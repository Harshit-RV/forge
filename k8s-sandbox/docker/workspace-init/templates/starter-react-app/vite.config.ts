import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    // Must not bind to loopback only, or the port-forward cannot reach it.
    host: "0.0.0.0",
    // Preview hosts are wildcard subdomains; Vite blocks unknown hosts by default.
    allowedHosts: true,
  },
});
