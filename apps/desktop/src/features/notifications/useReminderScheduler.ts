/**
 * 알림 스케줄러 훅
 * 1분 간격으로 미발송 알림을 체크하고 발송
 */

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { eq, lte, and } from 'drizzle-orm';
import { db } from '../../db/database';
import { reminders, tasks } from '@taskdown/db';
import { sendTaskNotification } from './notifications';
import { useAppStore } from '../../stores';
import { reminderQueryKeys } from './useReminders';

const CHECK_INTERVAL = 60000; // 1분

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
   */
  const processReminders = useCallback(async () => {
    // 이미 처리 중이면 스킵
    if (isProcessingRef.current) return;

    // 알림 권한이 없으면 스킵
    if (notificationPermission !== 'granted') return;

    isProcessingRef.current = true;

    try {
      const now = new Date();

      // 미발송 + 현재 시간 이전인 알림 조회
      const pendingReminders = await db
        .select()
        .from(reminders)
        .where(
          and(
            eq(reminders.isSent, false),
            lte(reminders.remindAt, now)
          )
        );

      for (const reminder of pendingReminders) {
        // 태스크 정보 조회
        const taskResult = await db
          .select({ title: tasks.title, status: tasks.status })
          .from(tasks)
          .where(eq(tasks.id, reminder.taskId));

        const task = taskResult[0];

        // 태스크가 없거나 완료된 경우 알림 발송하지 않고 sent 처리
        if (!task || task.status === 'done') {
          await db
            .update(reminders)
            .set({ isSent: true })
            .where(eq(reminders.id, reminder.id));
          continue;
        }

        // 알림 발송
        const sent = await sendTaskNotification(task.title);

        // 발송 결과와 관계없이 isSent = true로 마킹 (중복 발송 방지)
        await db
          .update(reminders)
          .set({ isSent: true })
          .where(eq(reminders.id, reminder.id));

        if (sent) {
          console.log(`Reminder sent for task: ${task.title}`);
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
    // 초기 처리 (약간의 딜레이 후)
    const initialTimeout = setTimeout(() => {
      processReminders();
    }, 2000);

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
    }, CHECK_INTERVAL);

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
