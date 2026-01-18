import { Toolbar } from '../features/layout';
import { QuickTaskInput } from '../features/tasks';
import { KanbanBoard } from '../features/kanban';
import type { Task, Project, TaskStatus } from '@taskdown/db';

interface KanbanViewProps {
  project?: Project | null;
  tasks: Task[];
  onNewTask: (title: string) => void;
  onTaskClick: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
  onTaskReorder: (taskId: string, status: TaskStatus, sortOrder: number) => void;
  isLoading?: boolean;
}

export function KanbanView({
  project,
  tasks,
  onNewTask,
  onTaskClick,
  onTaskStatusChange,
  onTaskReorder,
  isLoading = false,
}: KanbanViewProps) {
  const title = project ? project.name : 'Inbox';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <Toolbar title={title} />

      {/* 빠른 태스크 입력 */}
      <div className="px-4 pt-4">
        {project && (
          <div className="flex items-center gap-3 mb-4">
            <span
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: project.color || '#6366f1' }}
            />
            <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
          </div>
        )}
        <QuickTaskInput onSubmit={onNewTask} placeholder="새 태스크 추가... (Enter)" />
      </div>

      {/* 칸반 보드 */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            태스크 로딩 중...
          </div>
        ) : (
          <KanbanBoard
            tasks={tasks}
            onTaskClick={onTaskClick}
            onTaskStatusChange={onTaskStatusChange}
            onTaskReorder={onTaskReorder}
          />
        )}
      </div>
    </div>
  );
}
