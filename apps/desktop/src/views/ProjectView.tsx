import { Toolbar } from '../features/layout';
import { TaskCard, QuickTaskInput } from '../features/tasks';
import type { Task, Project, TaskStatus } from '@taskdown/db';

interface ProjectViewProps {
  project: Project;
  tasks: Task[];
  onNewTask: (title: string) => void;
  onTaskClick: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
  isLoading?: boolean;
}

export function ProjectView({
  project,
  tasks,
  onNewTask,
  onTaskClick,
  onTaskStatusChange,
  isLoading = false,
}: ProjectViewProps) {
  return (
    <div className="flex-1 flex flex-col">
      <Toolbar title={project.name} onNewTask={() => {}} />

      <div className="flex-1 overflow-y-auto p-4">
        {/* 프로젝트 헤더 */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: project.color || '#6366f1' }}
          />
          <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
        </div>

        {/* 빠른 태스크 입력 */}
        <QuickTaskInput onSubmit={onNewTask} placeholder="새 태스크 추가... (Enter)" />

        {/* 태스크 목록 */}
        <div className="mt-4 space-y-2">
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">태스크 로딩 중...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>아직 태스크가 없습니다</p>
              <p className="text-sm mt-1">위 입력 필드에서 새 태스크를 추가하세요</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task.id)}
                onStatusChange={(status) => onTaskStatusChange(task.id, status)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
