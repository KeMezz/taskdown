import { vi } from "vitest";

/**
 * Tauri API 모킹
 * 테스트 환경에서 Tauri API 호출을 가로챕니다.
 */

// @tauri-apps/api/core
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

// @tauri-apps/api/event
vi.mock("@tauri-apps/api/event", () => ({
  listen: vi.fn(() => Promise.resolve(() => {})),
  emit: vi.fn(),
  once: vi.fn(() => Promise.resolve(() => {})),
}));

// @tauri-apps/api/window
vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: vi.fn(() => ({
    listen: vi.fn(() => Promise.resolve(() => {})),
    emit: vi.fn(),
  })),
}));

// @tauri-apps/plugin-dialog
vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn(),
  save: vi.fn(),
  message: vi.fn(),
  ask: vi.fn(),
  confirm: vi.fn(),
}));

// @tauri-apps/plugin-fs
vi.mock("@tauri-apps/plugin-fs", () => ({
  readDir: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  remove: vi.fn(),
  exists: vi.fn(),
  stat: vi.fn(),
  BaseDirectory: {
    AppData: 0,
    AppConfig: 1,
    Document: 2,
    Home: 3,
  },
}));

// @tauri-apps/plugin-notification
vi.mock("@tauri-apps/plugin-notification", () => ({
  sendNotification: vi.fn(),
  requestPermission: vi.fn(() => Promise.resolve("granted")),
  isPermissionGranted: vi.fn(() => Promise.resolve(true)),
}));

// @tauri-apps/plugin-sql
vi.mock("@tauri-apps/plugin-sql", () => {
  const mockDatabase = {
    execute: vi.fn(() => Promise.resolve({ rowsAffected: 0 })),
    select: vi.fn(() => Promise.resolve([])),
    close: vi.fn(() => Promise.resolve()),
  };

  return {
    default: {
      load: vi.fn(() => Promise.resolve(mockDatabase)),
    },
  };
});
