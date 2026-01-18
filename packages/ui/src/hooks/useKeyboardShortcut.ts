import { useEffect } from 'react';

export type Modifier = 'meta' | 'ctrl' | 'shift' | 'alt';

export interface ShortcutOptions {
  key: string;
  modifiers?: Modifier[];
  callback: () => void;
  enabled?: boolean;
}

function isMac(): boolean {
  return navigator.platform.toUpperCase().includes('MAC');
}

/**
 * 키보드 단축키를 등록하는 훅
 *
 * @example
 * ```tsx
 * // 새 태스크 생성 (Cmd+N on macOS, Ctrl+N on Windows/Linux)
 * useKeyboardShortcut({
 *   key: 'n',
 *   modifiers: ['meta'],
 *   callback: () => createNewTask(),
 * });
 *
 * // Shift 조합 (Cmd+Shift+N on macOS, Ctrl+Shift+N on Windows/Linux)
 * useKeyboardShortcut({
 *   key: 'n',
 *   modifiers: ['meta', 'shift'],
 *   callback: () => createNewProject(),
 * });
 *
 * // ESC 키 (modifier 없이)
 * useKeyboardShortcut({
 *   key: 'Escape',
 *   callback: () => closePanel(),
 *   enabled: isPanelOpen,
 * });
 * ```
 */
export function useKeyboardShortcut({
  key,
  modifiers = [],
  callback,
  enabled = true,
}: ShortcutOptions): void {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent): void {
      const isModifierMatch = modifiers.every((mod) => {
        switch (mod) {
          case 'meta':
            // macOS: Cmd, Windows/Linux: Ctrl
            return isMac() ? event.metaKey : event.ctrlKey;
          case 'ctrl':
            return event.ctrlKey;
          case 'shift':
            return event.shiftKey;
          case 'alt':
            return event.altKey;
          default:
            return false;
        }
      });

      if (isModifierMatch && event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault();
        callback();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, modifiers, callback, enabled]);
}
