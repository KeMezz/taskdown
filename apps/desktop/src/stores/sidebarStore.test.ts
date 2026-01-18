import { describe, it, expect, beforeEach } from 'vitest';
import { useSidebarStore } from './sidebarStore';

describe('sidebarStore', () => {
  beforeEach(() => {
    useSidebarStore.getState().reset();
  });

  describe('초기 상태', () => {
    it('selectedProjectId는 null (Inbox)이어야 한다', () => {
      const { selectedProjectId } = useSidebarStore.getState();
      expect(selectedProjectId).toBeNull();
    });

    it('isCollapsed는 false이어야 한다', () => {
      const { isCollapsed } = useSidebarStore.getState();
      expect(isCollapsed).toBe(false);
    });
  });

  describe('selectProject', () => {
    it('프로젝트 ID를 설정할 수 있다', () => {
      useSidebarStore.getState().selectProject('project-1');
      expect(useSidebarStore.getState().selectedProjectId).toBe('project-1');
    });

    it('null로 설정하면 Inbox로 전환된다', () => {
      useSidebarStore.getState().selectProject('project-1');
      useSidebarStore.getState().selectProject(null);
      expect(useSidebarStore.getState().selectedProjectId).toBeNull();
    });
  });

  describe('toggleCollapsed', () => {
    it('사이드바를 접을 수 있다', () => {
      useSidebarStore.getState().toggleCollapsed();
      expect(useSidebarStore.getState().isCollapsed).toBe(true);
    });

    it('사이드바를 다시 펼 수 있다', () => {
      useSidebarStore.getState().toggleCollapsed();
      useSidebarStore.getState().toggleCollapsed();
      expect(useSidebarStore.getState().isCollapsed).toBe(false);
    });
  });

  describe('setCollapsed', () => {
    it('사이드바 접힘 상태를 직접 설정할 수 있다', () => {
      useSidebarStore.getState().setCollapsed(true);
      expect(useSidebarStore.getState().isCollapsed).toBe(true);

      useSidebarStore.getState().setCollapsed(false);
      expect(useSidebarStore.getState().isCollapsed).toBe(false);
    });
  });

  describe('reset', () => {
    it('모든 상태를 초기값으로 리셋한다', () => {
      useSidebarStore.getState().selectProject('project-1');
      useSidebarStore.getState().setCollapsed(true);
      useSidebarStore.getState().reset();

      const state = useSidebarStore.getState();
      expect(state.selectedProjectId).toBeNull();
      expect(state.isCollapsed).toBe(false);
    });
  });
});
