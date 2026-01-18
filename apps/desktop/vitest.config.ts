import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    name: "desktop",
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: [path.resolve(__dirname, "./src/testing/setup.ts")],
    root: path.resolve(__dirname),
  },
});
