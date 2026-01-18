import type { Task, TaskStatus } from '@taskdown/db';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onStatusChange: (status: TaskStatus) => void;
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  backlog: 'bg-gray-100 text-gray-600',
  next: 'bg-blue-100 text-blue-600',
  waiting: 'bg-yellow-100 text-yellow-600',
  done: 'bg-green-100 text-green-600',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  next: 'Next',
  waiting: 'Waiting',
  done: 'Done',
};

export function TaskCard({ task, onClick, onStatusChange }: TaskCardProps) {
  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(e.target.value as TaskStatus);
  };

  const formatDueDate = (date: Date | null) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const isOverdue = d < now && task.status !== 'done';
    const formatted = d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });

    return (
      <span className={isOverdue ? 'text-red-500' : 'text-gray-500'}>
        📅 {formatted}
      </span>
    );
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm font-medium truncate ${
              task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'
            }`}
          >
            {task.title}
          </h3>

          {task.dueDate && (
            <div className="mt-1 text-xs">{formatDueDate(task.dueDate)}</div>
          )}
        </div>

        <div onClick={handleStatusClick}>
          <select
            value={task.status ?? 'backlog'}
            onChange={handleStatusChange}
            className={`text-xs px-2 py-1 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              STATUS_COLORS[task.status ?? 'backlog']
            }`}
          >
            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
