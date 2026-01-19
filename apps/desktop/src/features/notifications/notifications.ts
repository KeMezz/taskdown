/**
 * 알림 관련 유틸리티 함수
 */

import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification';
import type { NotificationPermission } from '../../stores/appStore';

/**
 * 알림 권한 상태 확인
 */
export async function checkNotificationPermission(): Promise<NotificationPermission> {
  try {
    const granted = await isPermissionGranted();
    return granted ? 'granted' : 'default';
  } catch (error) {
    console.error('Failed to check notification permission:', error);
    return null;
  }
}

/**
 * 알림 권한 요청
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  try {
    const permission = await requestPermission();
    // Tauri의 requestPermission은 'granted', 'denied', 'default' 를 반환
    return permission as NotificationPermission;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return 'denied';
  }
}

/**
 * OS 네이티브 알림 발송
 */
export async function sendTaskNotification(
  taskTitle: string,
  options?: { body?: string }
): Promise<boolean> {
  try {
    const granted = await isPermissionGranted();
    if (!granted) {
      console.warn('Notification permission not granted');
      return false;
    }

    await sendNotification({
      title: 'Taskdown',
      body: options?.body || `마감: ${taskTitle}`,
    });
    return true;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}
