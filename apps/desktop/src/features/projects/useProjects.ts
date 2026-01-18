import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../../db/database';
import { queryKeys } from '../../lib';
import { projects } from '@taskdown/db';
import type { Project, NewProject, UpdateProject } from '@taskdown/db';

/**
 * 전체 프로젝트 목록 조회
 */
export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: async (): Promise<Project[]> => {
      const result = await db.select().from(projects).orderBy(projects.sortOrder);
      return result;
    },
  });
}

/**
 * 단일 프로젝트 조회
 */
export function useProject(id: string | null) {
  return useQuery({
    queryKey: queryKeys.project(id || ''),
    queryFn: async (): Promise<Project | null> => {
      if (!id) return null;
      const result = await db.select().from(projects).where(eq(projects.id, id));
      return result[0] ?? null;
    },
    enabled: !!id,
  });
}

/**
 * 프로젝트 생성
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Pick<NewProject, 'name' | 'color' | 'icon'>): Promise<Project> => {
      const now = new Date();
      const newProject: NewProject = {
        id: nanoid(),
        name: data.name,
        color: data.color ?? '#6366f1',
        icon: data.icon ?? null,
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
      };

      await db.insert(projects).values(newProject);

      return {
        ...newProject,
        sortOrder: newProject.sortOrder ?? 0,
        color: newProject.color ?? '#6366f1',
        icon: newProject.icon ?? null,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

/**
 * 프로젝트 업데이트
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProject }): Promise<void> => {
      await db
        .update(projects)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(projects.id, id));
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({ queryKey: queryKeys.project(id) });
    },
  });
}

/**
 * 프로젝트 삭제
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await db.delete(projects).where(eq(projects.id, id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}
