/**
 * 알림 스케줄러 훅
 * 1분 간격으로 미발송 알림을 체크하고 발송
 */

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';
import { db } from '../../db/database';
import { reminders } from '@taskdown/db';
import { sendTaskNotification } from './notifications';
import { useAppStore } from '../../stores';
import {
  reminderQueryKeys,
  fetchPendingRemindersWithTasks,
  REMINDER_REFETCH_INTERVAL,
} from './useReminders';

/** 앱 초기화 완료 대기 시간 (2초) */
const INITIAL_DELAY = 2000;

/**
 * 알림 스케줄러 훅
 * 앱 최상위에서 한 번만 호출하여 사용
 */
export function useReminderScheduler() {
  const queryClient = useQueryClient();
  const { notificationPermission } = useAppStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isProcessingRef = useRef(false);

  /**
   * 미발송 알림 조회 및 발송
   * JOIN을 사용하여 N+1 쿼리 문제 해결
   */
  const processReminders = useCallback(async () => {
    // 이미 처리 중이면 스킵
    if (isProcessingRef.current) return;

    // 알림 권한이 없으면 스킵
    if (notificationPermission !== 'granted') return;

    isProcessingRef.current = true;

    try {
      // 미발송 알림과 태스크 정보를 한 번의 쿼리로 조회
      const pendingReminders = await fetchPendingRemindersWithTasks();

      for (const reminder of pendingReminders) {
        // 태스크가 없거나 완료된 경우 알림 발송하지 않고 sent 처리
        if (!reminder.task || reminder.task.status === 'done') {
          await db
            .update(reminders)
            .set({ isSent: true })
            .where(eq(reminders.id, reminder.id));
          continue;
        }

        // 알림 발송
        const sent = await sendTaskNotification(reminder.task.title);

        // 발송 결과와 관계없이 isSent = true로 마킹 (중복 발송 방지)
        await db
          .update(reminders)
          .set({ isSent: true })
          .where(eq(reminders.id, reminder.id));

        if (sent) {
          console.log(`Reminder sent for task: ${reminder.task.title}`);
        }
      }

      // 쿼리 캐시 무효화
      if (pendingReminders.length > 0) {
        queryClient.invalidateQueries({ queryKey: reminderQueryKeys.pending });
      }
    } catch (error) {
      console.error('Error processing reminders:', error);
    } finally {
      isProcessingRef.current = false;
    }
  }, [notificationPermission, queryClient]);

  /**
   * 앱 시작 시 누락된 알림 즉시 처리
   */
  useEffect(() => {
    // 초기 처리 (앱 초기화 완료 대기 후)
    const initialTimeout = setTimeout(() => {
      processReminders();
    }, INITIAL_DELAY);

    return () => clearTimeout(initialTimeout);
  }, [processReminders]);

  /**
   * 1분 간격 스케줄러 설정
   */
  useEffect(() => {
    if (notificationPermission !== 'granted') {
      // 권한이 없으면 스케줄러 중지
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 스케줄러 시작
    intervalRef.current = setInterval(() => {
      processReminders();
    }, REMINDER_REFETCH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [notificationPermission, processReminders]);

  return {
    processReminders,
  };
}
