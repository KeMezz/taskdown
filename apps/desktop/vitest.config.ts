import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "desktop",
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["./src/testing/setup.ts"],
  },
});
