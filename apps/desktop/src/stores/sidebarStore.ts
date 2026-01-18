import { create } from 'zustand';

export type SidebarView = 'inbox' | 'project' | 'settings';

export interface SidebarState {
  currentView: SidebarView;
  selectedProjectId: string | null;
  setView: (view: SidebarView) => void;
  selectProject: (id: string | null) => void;
  goToInbox: () => void;
  goToSettings: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  currentView: 'inbox',
  selectedProjectId: null,

  setView: (view) => set({ currentView: view }),

  selectProject: (id) =>
    set({
      currentView: id ? 'project' : 'inbox',
      selectedProjectId: id,
    }),

  goToInbox: () =>
    set({
      currentView: 'inbox',
      selectedProjectId: null,
    }),

  goToSettings: () =>
    set({
      currentView: 'settings',
      selectedProjectId: null,
    }),
}));
