import type { Task } from '@taskdown/db';
import { useTaskStore } from '../../stores';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const selectTask = useTaskStore((s) => s.selectTask);

  const statusColors: Record<string, string> = {
    backlog: 'bg-gray-100 text-gray-600',
    next: 'bg-blue-100 text-blue-700',
    waiting: 'bg-yellow-100 text-yellow-700',
    done: 'bg-green-100 text-green-700',
  };

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const dueDateLabel =
    dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate.toLocaleDateString('ko-KR') : null;

  const title = task.title?.trim().length ? task.title : '제목 없음';

  return (
    <button
      onClick={() => selectTask(task.id)}
      className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all group text-gray-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium truncate text-gray-900">{title}</h3>
          {dueDateLabel && <p className="text-xs text-gray-500 mt-1">마감: {dueDateLabel}</p>}
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded ${statusColors[task.status ?? 'backlog']}`}
        >
          {task.status}
        </span>
      </div>
    </button>
  );
}
