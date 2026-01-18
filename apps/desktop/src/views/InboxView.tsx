import { useTasks } from '../features/tasks';
import { TaskCard } from '../features/tasks/TaskCard';
import { QuickTaskInput } from '../features/tasks/QuickTaskInput';
import { useTaskStore } from '../stores';

export function InboxView() {
  const { data: tasks, isLoading } = useTasks(null);
  const isQuickInputActive = useTaskStore((s) => s.isQuickInputActive);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
        <p className="text-sm text-gray-500 mt-1">프로젝트에 할당되지 않은 태스크</p>
      </div>

      {isQuickInputActive && <QuickTaskInput projectId={null} />}

      <div className="space-y-2">
        {tasks?.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}

        {(!tasks || tasks.length === 0) && !isQuickInputActive && (
          <div className="text-center py-12">
            <p className="text-gray-400">태스크가 없습니다</p>
            <p className="text-sm text-gray-400 mt-1">⌘N을 눌러 새 태스크를 추가하세요</p>
          </div>
        )}
      </div>
    </div>
  );
}
