import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  build: {
    outDir: resolve(__dirname, "../dist/client"),
    assetsDir: "assets",
  },
  plugins: [react()],
});
