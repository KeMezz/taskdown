/**
 * 앱 전역 상태 스토어
 */

import { create } from 'zustand';

export interface AppState {
  /** Vault 폴더 경로 */
  vaultPath: string | null;
  /** 앱 초기화 완료 여부 */
  isInitialized: boolean;
  /** 초기화 진행 중 여부 */
  isInitializing: boolean;
  /** 읽기 전용 모드 (마이그레이션 실패 시) */
  isReadOnly: boolean;
  /** 마이그레이션 에러 메시지 */
  migrationError: string | null;

  /** Vault 경로 설정 */
  setVaultPath: (path: string | null) => void;
  /** 초기화 완료 설정 */
  setInitialized: (value: boolean) => void;
  /** 초기화 진행 중 설정 */
  setInitializing: (value: boolean) => void;
  /** 읽기 전용 모드 설정 */
  setReadOnlyMode: (error: string) => void;
  /** 읽기 전용 모드 해제 */
  clearReadOnlyMode: () => void;
  /** 상태 초기화 */
  reset: () => void;
}

const initialState = {
  vaultPath: null,
  isInitialized: false,
  isInitializing: false,
  isReadOnly: false,
  migrationError: null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setVaultPath: (path) => set({ vaultPath: path }),

  setInitialized: (value) => set({ isInitialized: value }),

  setInitializing: (value) => set({ isInitializing: value }),

  setReadOnlyMode: (error) =>
    set({
      isReadOnly: true,
      migrationError: error,
    }),

  clearReadOnlyMode: () =>
    set({
      isReadOnly: false,
      migrationError: null,
    }),

  reset: () => set(initialState),
}));
