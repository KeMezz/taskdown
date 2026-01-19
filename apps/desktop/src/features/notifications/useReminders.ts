/**
 * 리마인더 CRUD 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eq, lte, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../../db/database';
import { reminders, tasks } from '@taskdown/db';
import type { Reminder, NewReminder, TaskStatus } from '@taskdown/db';

/** 알림 조회 간격 (1분) */
export const REMINDER_REFETCH_INTERVAL = 60000;
/** 알림 데이터 stale 시간 (30초) */
export const REMINDER_STALE_TIME = 30000;

/** 태스크 정보가 포함된 리마인더 타입 */
export interface ReminderWithTask extends Reminder {
  task: { title: string; status: TaskStatus } | null;
}

/**
 * 미발송 알림과 태스크 정보를 JOIN하여 조회
 * N+1 쿼리 문제를 해결하기 위한 공통 함수
 */
export async function fetchPendingRemindersWithTasks(): Promise<ReminderWithTask[]> {
  const now = new Date();

  const result = await db
    .select({
      id: reminders.id,
      taskId: reminders.taskId,
      remindAt: reminders.remindAt,
      isSent: reminders.isSent,
      createdAt: reminders.createdAt,
      taskTitle: tasks.title,
      taskStatus: tasks.status,
    })
    .from(reminders)
    .leftJoin(tasks, eq(reminders.taskId, tasks.id))
    .where(
      and(
        eq(reminders.isSent, false),
        lte(reminders.remindAt, now)
      )
    );

  return result.map((row) => ({
    id: row.id,
    taskId: row.taskId,
    remindAt: row.remindAt,
    isSent: row.isSent ?? false,
    createdAt: row.createdAt,
    task: row.taskTitle ? { title: row.taskTitle, status: row.taskStatus as TaskStatus } : null,
  }));
}

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
 * JOIN을 사용하여 N+1 쿼리 문제 해결
 */
export function usePendingReminders() {
  return useQuery({
    queryKey: reminderQueryKeys.pending,
    queryFn: fetchPendingRemindersWithTasks,
    refetchInterval: REMINDER_REFETCH_INTERVAL,
    staleTime: REMINDER_STALE_TIME,
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

