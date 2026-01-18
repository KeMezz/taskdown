import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from './taskStore';

describe('taskStore', () => {
  beforeEach(() => {
    useTaskStore.getState().reset();
  });

  describe('초기 상태', () => {
    it('selectedTaskId는 null이어야 한다', () => {
      const { selectedTaskId } = useTaskStore.getState();
      expect(selectedTaskId).toBeNull();
    });
  });

  describe('selectTask', () => {
    it('태스크 ID를 설정할 수 있다', () => {
      useTaskStore.getState().selectTask('task-1');
      expect(useTaskStore.getState().selectedTaskId).toBe('task-1');
    });

    it('null로 설정하면 선택 해제된다', () => {
      useTaskStore.getState().selectTask('task-1');
      useTaskStore.getState().selectTask(null);
      expect(useTaskStore.getState().selectedTaskId).toBeNull();
    });

    it('다른 태스크로 변경할 수 있다', () => {
      useTaskStore.getState().selectTask('task-1');
      useTaskStore.getState().selectTask('task-2');
      expect(useTaskStore.getState().selectedTaskId).toBe('task-2');
    });
  });

  describe('reset', () => {
    it('상태를 초기값으로 리셋한다', () => {
      useTaskStore.getState().selectTask('task-1');
      useTaskStore.getState().reset();

      expect(useTaskStore.getState().selectedTaskId).toBeNull();
    });
  });
});
