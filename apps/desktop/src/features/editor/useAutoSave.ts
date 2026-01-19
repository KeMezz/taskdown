import { useCallback, useEffect, useRef, useState } from 'react';
import type { JSONContent } from '@tiptap/core';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions {
  /** 저장 함수 */
  onSave: (content: JSONContent) => Promise<void>;
  /** 디바운스 지연 시간 (ms) */
  debounceMs?: number;
  /** 저장 상태 표시 지속 시간 (ms) */
  savedDisplayMs?: number;
}

/**
 * 자동 저장 훅
 * 디바운스된 저장과 저장 상태 관리
 */
export function useAutoSave({
  onSave,
  debounceMs = 500,
  savedDisplayMs = 1500,
}: UseAutoSaveOptions) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timeoutRef = useRef<number | null>(null);
  const savedTimeoutRef = useRef<number | null>(null);
  const pendingContentRef = useRef<JSONContent | null>(null);
  const debouncedContentRef = useRef<JSONContent | null>(null);
  const isSavingRef = useRef(false);

  // cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    };
  }, []);

  const saveContent = useCallback(
    async (content: JSONContent) => {
      if (isSavingRef.current) {
        // 이미 저장 중이면 대기열에 추가
        pendingContentRef.current = content;
        return;
      }

      isSavingRef.current = true;
      setStatus('saving');

      try {
        await onSave(content);
        setStatus('saved');

        // saved 상태를 일정 시간 후 idle로 변경
        if (savedTimeoutRef.current) {
          clearTimeout(savedTimeoutRef.current);
        }
        savedTimeoutRef.current = window.setTimeout(() => {
          setStatus('idle');
        }, savedDisplayMs);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setStatus('error');
      } finally {
        isSavingRef.current = false;

        // 대기 중인 저장이 있으면 실행
        if (pendingContentRef.current) {
          const pendingContent = pendingContentRef.current;
          pendingContentRef.current = null;
          saveContent(pendingContent);
        }
      }
    },
    [onSave, savedDisplayMs]
  );

  const debouncedSave = useCallback(
    (content: JSONContent) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 디바운스 대기 중인 콘텐츠 추적
      debouncedContentRef.current = content;

      timeoutRef.current = window.setTimeout(() => {
        debouncedContentRef.current = null;
        saveContent(content);
      }, debounceMs);
    },
    [saveContent, debounceMs]
  );

  const flushSave = useCallback(async () => {
    // 타임아웃 취소
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // 디바운스 대기 중인 콘텐츠가 있으면 즉시 저장
    if (debouncedContentRef.current) {
      const content = debouncedContentRef.current;
      debouncedContentRef.current = null;
      await saveContent(content);
      return;
    }

    // 저장 중 대기열에 있는 콘텐츠 처리
    if (pendingContentRef.current) {
      const content = pendingContentRef.current;
      pendingContentRef.current = null;
      await saveContent(content);
    }
  }, [saveContent]);

  return {
    /** 현재 저장 상태 */
    status,
    /** 디바운스된 저장 함수 */
    debouncedSave,
    /** 즉시 저장 함수 (타임아웃 무시) */
    flushSave,
  };
}

/**
 * 저장 상태 표시 컴포넌트용 헬퍼
 */
export function getSaveStatusText(status: SaveStatus): string {
  switch (status) {
    case 'saving':
      return '저장 중...';
    case 'saved':
      return '저장됨';
    case 'error':
      return '저장 실패';
    default:
      return '';
  }
}

export function getSaveStatusColor(status: SaveStatus): string {
  switch (status) {
    case 'saving':
      return 'text-gray-400';
    case 'saved':
      return 'text-green-500';
    case 'error':
      return 'text-red-500';
    default:
      return 'text-transparent';
  }
}
