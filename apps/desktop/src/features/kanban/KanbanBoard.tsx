import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '@taskdown/db';
import { KanbanColumn } from './KanbanColumn';
import { DragOverlayCard } from './DragOverlayCard';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
  onTaskReorder: (
    taskId: string,
    status: TaskStatus,
    newSortOrder: number
  ) => void;
}

const STATUSES: TaskStatus[] = ['backlog', 'next', 'waiting', 'done'];

export function KanbanBoard({
  tasks,
  onTaskClick,
  onTaskStatusChange,
  onTaskReorder,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // 상태별로 태스크 그룹화
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      backlog: [],
      next: [],
      waiting: [],
      done: [],
    };

    tasks.forEach((task) => {
      const status = task.status ?? 'backlog';
      grouped[status].push(task);
    });

    // 각 그룹을 sortOrder로 정렬
    Object.keys(grouped).forEach((status) => {
      grouped[status as TaskStatus].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      );
    });

    return grouped;
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 이동해야 드래그 시작
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const taskData = active.data.current;

    if (taskData?.type === 'task') {
      setActiveTask(taskData.task as Task);
    }
  }, []);

  const handleDragOver = useCallback(
    (_event: DragOverEvent) => {
      // 상태 변경은 onDragEnd에서 처리하므로 여기서는 아무것도 하지 않음
      // 향후 실시간 미리보기 등이 필요할 때 활용
    },
    []
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;
      const overData = over.data.current;

      // 드래그된 태스크 찾기
      const draggedTask = tasks.find((t) => t.id === activeId);
      if (!draggedTask) return;

      let targetStatus: TaskStatus;
      let targetTasks: Task[];
      let targetIndex: number;

      if (overData?.type === 'column') {
        // 빈 컬럼에 드롭
        targetStatus = overData.status as TaskStatus;
        targetTasks = tasksByStatus[targetStatus];
        targetIndex = targetTasks.length;
      } else if (overData?.type === 'task') {
        // 다른 태스크 위에 드롭
        const overTask = overData.task as Task;
        targetStatus = overTask.status ?? 'backlog';
        targetTasks = tasksByStatus[targetStatus];
        targetIndex = targetTasks.findIndex((t) => t.id === overId);
      } else {
        return;
      }

      const sourceStatus = draggedTask.status ?? 'backlog';

      // 상태가 변경된 경우
      if (sourceStatus !== targetStatus) {
        // 새 sortOrder 계산
        const newSortOrder = calculateSortOrder(targetTasks, targetIndex);
        onTaskStatusChange(activeId, targetStatus);
        onTaskReorder(activeId, targetStatus, newSortOrder);
        return;
      }

      // 같은 컬럼 내 재정렬
      const sourceTasks = [...tasksByStatus[sourceStatus]];
      const oldIndex = sourceTasks.findIndex((t) => t.id === activeId);
      const newIndex = targetIndex;

      if (oldIndex !== newIndex && oldIndex !== -1) {
        const reorderedTasks = arrayMove(sourceTasks, oldIndex, newIndex);
        const newSortOrder = calculateSortOrder(reorderedTasks, newIndex);
        onTaskReorder(activeId, sourceStatus, newSortOrder);
      }
    },
    [tasks, tasksByStatus, onTaskStatusChange, onTaskReorder]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 p-4 overflow-x-auto h-full">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            onTaskClick={onTaskClick}
            onTaskStatusChange={onTaskStatusChange}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? <DragOverlayCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

/**
 * 특정 위치에 삽입할 때의 sortOrder 계산
 * 인접 요소들의 sortOrder 중간값을 사용
 */
function calculateSortOrder(tasks: Task[], targetIndex: number): number {
  if (tasks.length === 0) {
    return 1000;
  }

  // 맨 처음에 삽입
  if (targetIndex === 0) {
    const firstOrder = tasks[0]?.sortOrder ?? 1000;
    return Math.max(0, firstOrder - 1000);
  }

  // 맨 끝에 삽입
  if (targetIndex >= tasks.length) {
    const lastOrder = tasks[tasks.length - 1]?.sortOrder ?? 0;
    return lastOrder + 1000;
  }

  // 중간에 삽입
  const prevOrder = tasks[targetIndex - 1]?.sortOrder ?? 0;
  const nextOrder = tasks[targetIndex]?.sortOrder ?? prevOrder + 2000;
  return Math.floor((prevOrder + nextOrder) / 2);
}
