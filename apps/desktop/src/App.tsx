import { useEffect, useState } from 'react';
import { useAppStore, useSidebarStore, useTaskStore } from './stores';
import { tryAutoLoadVault, QueryProvider } from './lib';
import { VaultSetup } from './features/vault';
import { MainLayout } from './features/layout';
import {
  useProjects,
  useCreateProject,
  ProjectDialog,
} from './features/projects';
import {
  useTasks,
  useCreateTask,
  useUpdateTaskStatus,
} from './features/tasks';
import { InboxView, ProjectView, SettingsView } from './views';

function AppContent() {
  const { isReadOnly, migrationError } = useAppStore();
  const { selectedProjectId, selectProject } = useSidebarStore();
  const { selectTask } = useTaskStore();
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);

  // 프로젝트 데이터
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects();
  const createProject = useCreateProject();

  // 현재 프로젝트
  const currentProject =
    selectedProjectId && selectedProjectId !== '__settings__'
      ? projects.find((p) => p.id === selectedProjectId)
      : null;

  // 태스크 데이터 (Inbox 또는 프로젝트)
  const effectiveProjectId =
    selectedProjectId === '__settings__' ? null : selectedProjectId;
  const { data: tasks = [], isLoading: isLoadingTasks } = useTasks(effectiveProjectId);
  const createTask = useCreateTask();
  const updateTaskStatus = useUpdateTaskStatus();

  const handleNewProject = () => {
    if (isReadOnly) return;
    setIsProjectDialogOpen(true);
  };

  const handleCreateProject = async (data: { name: string; color: string }) => {
    if (isReadOnly) return;
    const project = await createProject.mutateAsync(data);
    selectProject(project.id);
  };

  const handleNewTask = (title: string) => {
    if (isReadOnly) return;
    createTask.mutate({
      title,
      projectId: effectiveProjectId,
    });
  };

  const handleTaskClick = (taskId: string) => {
    selectTask(taskId);
    // TODO: Phase 5에서 상세 패널 구현
  };

  const handleTaskStatusChange = (taskId: string, status: 'backlog' | 'next' | 'waiting' | 'done') => {
    if (isReadOnly) return;
    updateTaskStatus.mutate({
      id: taskId,
      status,
      projectId: effectiveProjectId,
    });
  };

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key === 'n' && !e.shiftKey) {
        e.preventDefault();
        // 새 태스크 입력 필드에 포커스 (QuickTaskInput에서 처리)
        const input = document.querySelector<HTMLInputElement>('[placeholder*="새 태스크"]');
        input?.focus();
      }

      if (cmdOrCtrl && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        if (!isReadOnly) {
          setIsProjectDialogOpen(true);
        }
      }

      if (cmdOrCtrl && e.key === ',') {
        e.preventDefault();
        selectProject('__settings__');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectProject, isReadOnly]);

  const renderCurrentView = () => {
    if (selectedProjectId === '__settings__') {
      return <SettingsView />;
    }

    if (currentProject) {
      return (
        <ProjectView
          project={currentProject}
          tasks={tasks}
          onNewTask={handleNewTask}
          onTaskClick={handleTaskClick}
          onTaskStatusChange={handleTaskStatusChange}
          isLoading={isLoadingTasks}
        />
      );
    }

    // Inbox view (default)
    return (
      <InboxView
        tasks={tasks}
        onNewTask={handleNewTask}
        onTaskClick={handleTaskClick}
        onTaskStatusChange={handleTaskStatusChange}
        isLoading={isLoadingTasks}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isReadOnly && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <p className="text-sm text-yellow-800">
            <span className="font-medium">읽기 전용 모드:</span> {migrationError}
          </p>
        </div>
      )}
      <MainLayout
        projects={projects}
        onNewProject={handleNewProject}
        isLoadingProjects={isLoadingProjects}
      >
        {renderCurrentView()}
      </MainLayout>

      <ProjectDialog
        isOpen={isProjectDialogOpen}
        onClose={() => setIsProjectDialogOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { isInitialized, setVaultPath, setInitialized, setReadOnlyMode, setInitializing } =
    useAppStore();

  useEffect(() => {
    async function initApp() {
      try {
        setInitializing(true);

        // 이전에 사용한 Vault 자동 로드 시도
        const result = await tryAutoLoadVault();

        if (result?.success && result.vaultPath) {
          setVaultPath(result.vaultPath);

          if (result.isReadOnly && result.error) {
            setReadOnlyMode(result.error);
          }

          setInitialized(true);
        }
      } catch (error) {
        console.error('Failed to auto-load vault:', error);
      } finally {
        setIsLoading(false);
        setInitializing(false);
      }
    }

    initApp();
  }, [setVaultPath, setInitialized, setReadOnlyMode, setInitializing]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return <VaultSetup />;
  }

  return (
    <QueryProvider>
      <AppContent />
    </QueryProvider>
  );
}

export default App;
