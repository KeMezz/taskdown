/**
 * 사이드바 상태 스토어
 * 현재 선택된 프로젝트 관리
 */

import { create } from 'zustand';

export interface SidebarState {
  /** 현재 선택된 프로젝트 ID (null = Inbox) */
  selectedProjectId: string | null;
  /** 사이드바 접힘 상태 */
  isCollapsed: boolean;

  /** 프로젝트 선택 */
  selectProject: (id: string | null) => void;
  /** 사이드바 접기/펴기 토글 */
  toggleCollapsed: () => void;
  /** 사이드바 접힘 상태 설정 */
  setCollapsed: (collapsed: boolean) => void;
  /** 상태 초기화 */
  reset: () => void;
}

const initialState = {
  selectedProjectId: null,
  isCollapsed: false,
};

export const useSidebarStore = create<SidebarState>((set) => ({
  ...initialState,

  selectProject: (id) => set({ selectedProjectId: id }),

  toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),

  setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),

  reset: () => set(initialState),
}));
