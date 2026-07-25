import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "strip-live-server-redirect",
      transformIndexHtml(html, ctx) {
        if (ctx.server) return html;
        return html.replace(
          /<script>\s*\/\/ Live Server[\s\S]*?<\/script>\s*/i,
          ""
        );
      },
    },
  ],
  // Caminhos relativos: funciona em /cadastro/ (API/Docker) e no Live Server (dist/)
  base: "./",
  server: {
    port: 5173,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
