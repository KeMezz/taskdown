import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eq, isNull, asc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../../db';
import { tasks, type Task, type NewTask, type UpdateTask, type TaskStatus } from '@taskdown/db';
import { queryKeys } from '../../lib';

export function useTasks(projectId: string | null) {
  const selection = {
    id: tasks.id,
    title: tasks.title,
    content: tasks.content,
    projectId: tasks.projectId,
    status: tasks.status,
    dueDate: tasks.dueDate,
    sortOrder: tasks.sortOrder,
    createdAt: tasks.createdAt,
    updatedAt: tasks.updatedAt,
  };

  return useQuery({
    queryKey: queryKeys.tasks(projectId),
    queryFn: async (): Promise<Task[]> => {
      if (projectId === null) {
        return db
          .select(selection)
          .from(tasks)
          .where(isNull(tasks.projectId))
          .orderBy(asc(tasks.sortOrder));
      }
      return db
        .select(selection)
        .from(tasks)
        .where(eq(tasks.projectId, projectId))
        .orderBy(asc(tasks.sortOrder));
    },
  });
}

export function useTask(id: string | null) {
  return useQuery({
    queryKey: queryKeys.task(id ?? ''),
    queryFn: async (): Promise<Task | null> => {
      if (!id) return null;
      const result = await db.select().from(tasks).where(eq(tasks.id, id));
      return result[0] ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<NewTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
      const now = new Date();
      const newTask: NewTask = {
        ...data,
        id: nanoid(),
        createdAt: now,
        updatedAt: now,
      };

      await db.insert(tasks).values(newTask);

      return {
        ...newTask,
        content: newTask.content ?? '{}',
        projectId: newTask.projectId ?? null,
        status: newTask.status ?? 'backlog',
        dueDate: newTask.dueDate ?? null,
        sortOrder: newTask.sortOrder ?? 0,
      } as Task;
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(task.projectId) });
    },
  });
}

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
      queryClient.invalidateQueries({ queryKey: queryKeys.task(id) });

      if (previousProjectId !== undefined && data.projectId !== previousProjectId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks(previousProjectId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks(data.projectId ?? null) });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks(data.projectId ?? null) });
      }
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      sortOrder,
    }: {
      id: string;
      status: TaskStatus;
      sortOrder?: number;
    }): Promise<void> => {
      await db
        .update(tasks)
        .set({
          status,
          ...(sortOrder !== undefined && { sortOrder }),
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string; projectId: string | null }): Promise<void> => {
      await db.delete(tasks).where(eq(tasks.id, id));
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(projectId) });
    },
  });
}
