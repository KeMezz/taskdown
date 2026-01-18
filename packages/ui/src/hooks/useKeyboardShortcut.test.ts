/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, cleanup } from "@testing-library/react";
import { useKeyboardShortcut } from "./useKeyboardShortcut";

describe("useKeyboardShortcut", () => {
  beforeEach(() => {
    // Mock navigator.platform
    Object.defineProperty(navigator, "platform", {
      value: "MacIntel",
      writable: true,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("should call callback when key is pressed without modifiers", () => {
    const callback = vi.fn();

    renderHook(() =>
      useKeyboardShortcut({
        key: "Escape",
        callback,
      })
    );

    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
    );

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should call callback when key with meta modifier is pressed on Mac", () => {
    const callback = vi.fn();

    renderHook(() =>
      useKeyboardShortcut({
        key: "n",
        modifiers: ["meta"],
        callback,
      })
    );

    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "n", metaKey: true, bubbles: true })
    );

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should not call callback when enabled is false", () => {
    const callback = vi.fn();

    renderHook(() =>
      useKeyboardShortcut({
        key: "Escape",
        callback,
        enabled: false,
      })
    );

    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
    );

    expect(callback).not.toHaveBeenCalled();
  });

  it("should not call callback when modifier is not pressed", () => {
    const callback = vi.fn();

    renderHook(() =>
      useKeyboardShortcut({
        key: "n",
        modifiers: ["meta"],
        callback,
      })
    );

    // Press 'n' without meta key
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "n", bubbles: true })
    );

    expect(callback).not.toHaveBeenCalled();
  });

  it("should handle multiple modifiers", () => {
    const callback = vi.fn();

    renderHook(() =>
      useKeyboardShortcut({
        key: "n",
        modifiers: ["meta", "shift"],
        callback,
      })
    );

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "n",
        metaKey: true,
        shiftKey: true,
        bubbles: true,
      })
    );

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should use ctrl instead of meta on non-Mac platforms", () => {
    // Switch to Windows
    Object.defineProperty(navigator, "platform", {
      value: "Win32",
      writable: true,
    });

    const callback = vi.fn();

    renderHook(() =>
      useKeyboardShortcut({
        key: "n",
        modifiers: ["meta"],
        callback,
      })
    );

    // Should respond to Ctrl on Windows
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "n", ctrlKey: true, bubbles: true })
    );

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should be case-insensitive for key matching", () => {
    const callback = vi.fn();

    renderHook(() =>
      useKeyboardShortcut({
        key: "n",
        callback,
      })
    );

    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "N", bubbles: true })
    );

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should cleanup event listener on unmount", () => {
    const callback = vi.fn();
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() =>
      useKeyboardShortcut({
        key: "Escape",
        callback,
      })
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
  });
});
