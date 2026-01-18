import type { Task } from '@taskdown/db';

interface DragOverlayCardProps {
  task: Task;
}

export function DragOverlayCard({ task }: DragOverlayCardProps) {
  const formatDueDate = (date: Date | null) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const isOverdue = d < now && task.status !== 'done';
    const formatted = d.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });

    return (
      <span className={isOverdue ? 'text-red-500' : 'text-gray-500'}>
        {formatted}
      </span>
    );
  };

  return (
    <div className="bg-white border border-indigo-400 rounded-lg p-3 shadow-xl cursor-grabbing opacity-95 w-[280px]">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h4
            className={`text-sm font-medium truncate ${
              task.status === 'done'
                ? 'line-through text-gray-500'
                : 'text-gray-900'
            }`}
          >
            {task.title}
          </h4>

          {task.dueDate && (
            <div className="mt-1 text-xs flex items-center gap-1">
              <span className="text-gray-400">📅</span>
              {formatDueDate(task.dueDate)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
