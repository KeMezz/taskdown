import { create } from 'zustand';

export interface TaskState {
  selectedTaskId: string | null;
  isQuickInputActive: boolean;
  selectTask: (id: string | null) => void;
  closeDetailPanel: () => void;
  toggleQuickInput: () => void;
  activateQuickInput: () => void;
  deactivateQuickInput: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  selectedTaskId: null,
  isQuickInputActive: false,

  selectTask: (id) => set({ selectedTaskId: id }),

  closeDetailPanel: () => set({ selectedTaskId: null }),

  toggleQuickInput: () => set((state) => ({ isQuickInputActive: !state.isQuickInputActive })),

  activateQuickInput: () => set({ isQuickInputActive: true }),

  deactivateQuickInput: () => set({ isQuickInputActive: false }),
}));
