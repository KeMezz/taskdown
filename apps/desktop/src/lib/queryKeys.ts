export const queryKeys = {
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  tasks: (projectId: string | null) => ['tasks', { projectId }] as const,
  task: (id: string) => ['tasks', id] as const,
  inboxTasks: ['tasks', { projectId: null }] as const,
} as const;
