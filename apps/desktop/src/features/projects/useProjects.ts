import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eq, asc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../../db';
import { projects, type Project, type NewProject, type UpdateProject } from '@taskdown/db';
import { queryKeys } from '../../lib';

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: async (): Promise<Project[]> => {
      return db.select().from(projects).orderBy(asc(projects.sortOrder));
    },
  });
}

export function useProject(id: string | null) {
  return useQuery({
    queryKey: queryKeys.project(id ?? ''),
    queryFn: async (): Promise<Project | null> => {
      if (!id) return null;
      const result = await db.select().from(projects).where(eq(projects.id, id));
      return result[0] ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<NewProject, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Project> => {
      const now = new Date();
      const newProject: NewProject = {
        ...data,
        id: nanoid(),
        createdAt: now,
        updatedAt: now,
      };

      await db.insert(projects).values(newProject);

      return {
        ...newProject,
        color: newProject.color ?? '#6366f1',
        icon: newProject.icon ?? null,
        sortOrder: newProject.sortOrder ?? 0,
      } as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

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
