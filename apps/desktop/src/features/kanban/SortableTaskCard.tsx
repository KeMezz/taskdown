import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task, TaskStatus } from '@taskdown/db';

interface SortableTaskCardProps {
  task: Task;
  onClick: () => void;
  onStatusChange: (status: TaskStatus) => void;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  next: 'Next',
  waiting: 'Waiting',
  done: 'Done',
};

export const SortableTaskCard = memo(function SortableTaskCard({
  task,
  onClick,
  onStatusChange,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all ${
        isDragging
          ? 'opacity-50 shadow-lg ring-2 ring-indigo-400'
          : 'hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
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

        <div onClick={handleStatusClick} onPointerDown={(e) => e.stopPropagation()}>
          <select
            value={task.status ?? 'backlog'}
            onChange={handleStatusChange}
            className="text-xs px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-600 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
});
