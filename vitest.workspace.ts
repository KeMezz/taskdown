import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "packages/db/vitest.config.ts",
  "packages/ui/vitest.config.ts",
  "apps/desktop/vitest.config.ts",
]);
