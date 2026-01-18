import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eq, isNull } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../../db/database';
import { queryKeys } from '../../lib';
import { tasks } from '@taskdown/db';
import type { Task, NewTask, UpdateTask, TaskStatus } from '@taskdown/db';

/**
 * 프로젝트별 또는 Inbox 태스크 목록 조회
 */
export function useTasks(projectId: string | null) {
  return useQuery({
    queryKey: queryKeys.tasks(projectId),
    queryFn: async (): Promise<Task[]> => {
      if (projectId === null) {
        // Inbox: projectId가 null인 태스크
        const result = await db
          .select()
          .from(tasks)
          .where(isNull(tasks.projectId))
          .orderBy(tasks.sortOrder);
        return result;
      }

      // 특정 프로젝트의 태스크
      const result = await db
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, projectId))
        .orderBy(tasks.sortOrder);
      return result;
    },
  });
}

/**
 * 단일 태스크 조회
 */
export function useTask(id: string | null) {
  return useQuery({
    queryKey: queryKeys.task(id || ''),
    queryFn: async (): Promise<Task | null> => {
      if (!id) return null;
      const result = await db.select().from(tasks).where(eq(tasks.id, id));
      return result[0] ?? null;
    },
    enabled: !!id,
  });
}

/**
 * 태스크 생성
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Pick<NewTask, 'title' | 'projectId' | 'content' | 'status' | 'dueDate'>
    ): Promise<Task> => {
      const now = new Date();
      const newTask: NewTask = {
        id: nanoid(),
        title: data.title,
        content: data.content ?? '{}',
        projectId: data.projectId ?? null,
        status: data.status ?? 'backlog',
        dueDate: data.dueDate ?? null,
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
      };

      await db.insert(tasks).values(newTask);

      return {
        ...newTask,
        sortOrder: newTask.sortOrder ?? 0,
        content: newTask.content ?? '{}',
        status: (newTask.status as TaskStatus) ?? 'backlog',
        projectId: newTask.projectId ?? null,
        dueDate: newTask.dueDate ?? null,
      };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(variables.projectId ?? null) });
    },
  });
}

/**
 * 태스크 업데이트
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTask;
      previousProjectId?: string | null;
    }): Promise<void> => {
      await db
        .update(tasks)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(tasks.id, id));
    },
    onSuccess: (_, { id, data, previousProjectId }) => {
      // 태스크 캐시 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.task(id) });

      // 프로젝트가 변경된 경우 양쪽 프로젝트 캐시 무효화
      if (data.projectId !== undefined && data.projectId !== previousProjectId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks(previousProjectId ?? null) });
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks(data.projectId ?? null) });
      } else {
        // 현재 프로젝트만 무효화
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasks(data.projectId ?? previousProjectId ?? null),
        });
      }
    },
  });
}

/**
 * 태스크 삭제
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
    }: {
      id: string;
      projectId: string | null;
    }): Promise<void> => {
      await db.delete(tasks).where(eq(tasks.id, id));
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(projectId) });
    },
  });
}

/**
 * 태스크 상태 변경
 */
export function useUpdateTaskStatus() {
  const updateTask = useUpdateTask();

  return {
    ...updateTask,
    mutate: (params: { id: string; status: TaskStatus; projectId?: string | null }) => {
      updateTask.mutate({
        id: params.id,
        data: { status: params.status },
        previousProjectId: params.projectId,
      });
    },
    mutateAsync: async (params: { id: string; status: TaskStatus; projectId?: string | null }) => {
      await updateTask.mutateAsync({
        id: params.id,
        data: { status: params.status },
        previousProjectId: params.projectId,
      });
    },
  };
}
