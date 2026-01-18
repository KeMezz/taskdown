/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "./appStore";
import { resetAllStores } from "../testing/zustand";

describe("appStore", () => {
  beforeEach(() => {
    resetAllStores();
  });

  describe("initial state", () => {
    it("should have correct initial values", () => {
      const state = useAppStore.getState();

      expect(state.vaultPath).toBeNull();
      expect(state.isInitialized).toBe(false);
      expect(state.isInitializing).toBe(false);
      expect(state.isReadOnly).toBe(false);
      expect(state.migrationError).toBeNull();
    });
  });

  describe("setVaultPath", () => {
    it("should set vault path", () => {
      useAppStore.getState().setVaultPath("/path/to/vault");

      expect(useAppStore.getState().vaultPath).toBe("/path/to/vault");
    });

    it("should clear vault path when set to null", () => {
      useAppStore.getState().setVaultPath("/path/to/vault");
      useAppStore.getState().setVaultPath(null);

      expect(useAppStore.getState().vaultPath).toBeNull();
    });
  });

  describe("setInitialized", () => {
    it("should set initialized to true", () => {
      useAppStore.getState().setInitialized(true);

      expect(useAppStore.getState().isInitialized).toBe(true);
    });

    it("should set initialized to false", () => {
      useAppStore.getState().setInitialized(true);
      useAppStore.getState().setInitialized(false);

      expect(useAppStore.getState().isInitialized).toBe(false);
    });
  });

  describe("setInitializing", () => {
    it("should set initializing state", () => {
      useAppStore.getState().setInitializing(true);

      expect(useAppStore.getState().isInitializing).toBe(true);
    });
  });

  describe("setReadOnlyMode", () => {
    it("should enable read-only mode with error message", () => {
      useAppStore.getState().setReadOnlyMode("Migration failed");

      const state = useAppStore.getState();
      expect(state.isReadOnly).toBe(true);
      expect(state.migrationError).toBe("Migration failed");
    });
  });

  describe("clearReadOnlyMode", () => {
    it("should clear read-only mode", () => {
      useAppStore.getState().setReadOnlyMode("Migration failed");
      useAppStore.getState().clearReadOnlyMode();

      const state = useAppStore.getState();
      expect(state.isReadOnly).toBe(false);
      expect(state.migrationError).toBeNull();
    });
  });

  describe("reset", () => {
    it("should reset all state to initial values", () => {
      // Modify all state values
      useAppStore.getState().setVaultPath("/some/path");
      useAppStore.getState().setInitialized(true);
      useAppStore.getState().setInitializing(true);
      useAppStore.getState().setReadOnlyMode("Error");

      // Reset
      useAppStore.getState().reset();

      // Verify all values are reset
      const state = useAppStore.getState();
      expect(state.vaultPath).toBeNull();
      expect(state.isInitialized).toBe(false);
      expect(state.isInitializing).toBe(false);
      expect(state.isReadOnly).toBe(false);
      expect(state.migrationError).toBeNull();
    });
  });
});
