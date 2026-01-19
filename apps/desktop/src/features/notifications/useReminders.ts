/**
 * 리마인더 CRUD 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eq, lte, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../../db/database';
import { reminders, tasks } from '@taskdown/db';
import type { Reminder, NewReminder } from '@taskdown/db';

export const reminderQueryKeys = {
  all: ['reminders'] as const,
  byTask: (taskId: string) => ['reminders', 'task', taskId] as const,
  pending: ['reminders', 'pending'] as const,
};

/**
 * 태스크의 리마인더 조회
 */
export function useReminders(taskId: string | null) {
  return useQuery({
    queryKey: reminderQueryKeys.byTask(taskId || ''),
    queryFn: async (): Promise<Reminder[]> => {
      if (!taskId) return [];
      const result = await db
        .select()
        .from(reminders)
        .where(eq(reminders.taskId, taskId));
      return result;
    },
    enabled: !!taskId,
  });
}

/**
 * 발송 대기 중인 알림 조회 (현재 시간 이전, 미발송)
 */
export function usePendingReminders() {
  return useQuery({
    queryKey: reminderQueryKeys.pending,
    queryFn: async () => {
      const now = new Date();
      const pendingReminders = await db
        .select()
        .from(reminders)
        .where(
          and(
            eq(reminders.isSent, false),
            lte(reminders.remindAt, now)
          )
        );

      // 각 리마인더에 대한 태스크 정보 조회
      const result = await Promise.all(
        pendingReminders.map(async (reminder) => {
          const taskResult = await db
            .select({ title: tasks.title, status: tasks.status })
            .from(tasks)
            .where(eq(tasks.id, reminder.taskId));
          return {
            ...reminder,
            task: taskResult[0] || null,
          };
        })
      );

      return result;
    },
    refetchInterval: 60000, // 1분마다 자동 갱신
    staleTime: 30000, // 30초
  });
}

/**
 * 리마인더 생성
 */
export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Pick<NewReminder, 'taskId' | 'remindAt'>): Promise<Reminder> => {
      const now = new Date();
      const newReminder: NewReminder = {
        id: nanoid(),
        taskId: data.taskId,
        remindAt: data.remindAt,
        isSent: false,
        createdAt: now,
      };

      await db.insert(reminders).values(newReminder);

      return {
        ...newReminder,
        isSent: newReminder.isSent ?? false,
      };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reminderQueryKeys.byTask(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: reminderQueryKeys.pending });
    },
  });
}

/**
 * 리마인더 발송 완료 표시
 */
export function useMarkReminderSent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await db
        .update(reminders)
        .set({ isSent: true })
        .where(eq(reminders.id, id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: reminderQueryKeys.pending });
    },
  });
}

/**
 * 리마인더 삭제
 */
export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string; taskId: string }): Promise<void> => {
      await db.delete(reminders).where(eq(reminders.id, id));
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: reminderQueryKeys.byTask(taskId) });
      queryClient.invalidateQueries({ queryKey: reminderQueryKeys.pending });
    },
  });
}

/**
 * 태스크의 모든 리마인더 삭제
 */
export function useDeleteTaskReminders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string): Promise<void> => {
      await db.delete(reminders).where(eq(reminders.taskId, taskId));
    },
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: reminderQueryKeys.byTask(taskId) });
      queryClient.invalidateQueries({ queryKey: reminderQueryKeys.pending });
    },
  });
}

