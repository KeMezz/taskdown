/**
 * 태스크 상태 스토어
 * 현재 선택된 태스크 관리
 */

import { create } from 'zustand';

export interface TaskState {
  /** 현재 선택된 태스크 ID (상세 패널 열림) */
  selectedTaskId: string | null;

  /** 태스크 선택 */
  selectTask: (id: string | null) => void;
  /** 상태 초기화 */
  reset: () => void;
}

const initialState = {
  selectedTaskId: null,
};

export const useTaskStore = create<TaskState>((set) => ({
  ...initialState,

  selectTask: (id) => set({ selectedTaskId: id }),

  reset: () => set(initialState),
}));
