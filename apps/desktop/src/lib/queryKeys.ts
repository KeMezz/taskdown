/**
 * React Query 키 관리
 * 일관된 캐시 키 사용을 위한 중앙 관리
 */

export const queryKeys = {
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  tasks: (projectId: string | null) => ['tasks', { projectId }] as const,
  task: (id: string) => ['tasks', id] as const,
  inboxTasks: ['tasks', { projectId: null }] as const,
};
