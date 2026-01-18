import { useAppStore } from "../stores/appStore";
import { useSidebarStore } from "../stores/sidebarStore";
import { useTaskStore } from "../stores/taskStore";

/**
 * Zustand 스토어 초기화 헬퍼
 * 테스트 전에 스토어를 초기 상태로 리셋합니다.
 */
export function resetAllStores(): void {
  useAppStore.getState().reset();
  useSidebarStore.getState().reset();
  useTaskStore.getState().reset();
}

/**
 * 스토어 상태를 특정 값으로 설정하는 헬퍼
 */
export function setAppStoreState(
  state: Partial<ReturnType<typeof useAppStore.getState>>
): void {
  useAppStore.setState(state);
}

/**
 * 사이드바 스토어 상태 설정 헬퍼
 */
export function setSidebarStoreState(
  state: Partial<ReturnType<typeof useSidebarStore.getState>>
): void {
  useSidebarStore.setState(state);
}

/**
 * 태스크 스토어 상태 설정 헬퍼
 */
export function setTaskStoreState(
  state: Partial<ReturnType<typeof useTaskStore.getState>>
): void {
  useTaskStore.setState(state);
}
