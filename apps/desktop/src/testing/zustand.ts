import { useAppStore } from "../stores/appStore";

/**
 * Zustand 스토어 초기화 헬퍼
 * 테스트 전에 스토어를 초기 상태로 리셋합니다.
 */
export function resetAllStores(): void {
  useAppStore.getState().reset();
}

/**
 * 스토어 상태를 특정 값으로 설정하는 헬퍼
 */
export function setAppStoreState(
  state: Partial<ReturnType<typeof useAppStore.getState>>
): void {
  useAppStore.setState(state);
}
