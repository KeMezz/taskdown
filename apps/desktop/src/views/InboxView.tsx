import { Toolbar } from '../features/layout';
import { TaskCard, QuickTaskInput } from '../features/tasks';
import type { Task, TaskStatus } from '@taskdown/db';

interface InboxViewProps {
  tasks: Task[];
  onNewTask: (title: string) => void;
  onTaskClick: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
  isLoading?: boolean;
}

export function InboxView({
  tasks,
  onNewTask,
  onTaskClick,
  onTaskStatusChange,
  isLoading = false,
}: InboxViewProps) {
  return (
    <div className="flex-1 flex flex-col">
      <Toolbar title="Inbox" />

      <div className="flex-1 overflow-y-auto p-4">
        {/* 빠른 태스크 입력 */}
        <QuickTaskInput onSubmit={onNewTask} placeholder="새 태스크 추가... (Enter)" />

        {/* 태스크 목록 */}
        <div className="mt-4 space-y-2">
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">태스크 로딩 중...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Inbox가 비어 있습니다</p>
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
