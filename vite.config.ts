import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ["blockly"],
  },
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  define: {
    "process.env.VITE_AUTH_SECRET": JSON.stringify(
      process.env.VITE_AUTH_SECRET
    ),
  },
});
