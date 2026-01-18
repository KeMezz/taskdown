import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '@taskdown/db';
import { SortableTaskCard } from './SortableTaskCard';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
}

const COLUMN_CONFIG: Record<
  TaskStatus,
  { title: string; bgColor: string; headerColor: string }
> = {
  backlog: {
    title: 'Backlog',
    bgColor: 'bg-gray-50',
    headerColor: 'bg-gray-100 text-gray-700',
  },
  next: {
    title: 'Next',
    bgColor: 'bg-blue-50',
    headerColor: 'bg-blue-100 text-blue-700',
  },
  waiting: {
    title: 'Waiting',
    bgColor: 'bg-yellow-50',
    headerColor: 'bg-yellow-100 text-yellow-700',
  },
  done: {
    title: 'Done',
    bgColor: 'bg-green-50',
    headerColor: 'bg-green-100 text-green-700',
  },
};

export function KanbanColumn({
  status,
  tasks,
  onTaskClick,
  onTaskStatusChange,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'column', status },
  });

  const config = COLUMN_CONFIG[status];
  const taskIds = tasks.map((task) => task.id);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[260px] max-w-[300px] min-h-[400px] flex-1 rounded-lg ${config.bgColor} ${
        isOver ? 'ring-2 ring-indigo-400 ring-opacity-50' : ''
      }`}
    >
      {/* Column Header */}
      <div
        className={`flex items-center justify-between px-3 py-2 rounded-t-lg ${config.headerColor}`}
      >
        <h3 className="font-medium text-sm">{config.title}</h3>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/50">
          {tasks.length}
        </span>
      </div>

      {/* Column Content */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[100px] text-gray-400 text-sm">
              No tasks
            </div>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task.id)}
                onStatusChange={(newStatus) =>
                  onTaskStatusChange(task.id, newStatus)
                }
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
