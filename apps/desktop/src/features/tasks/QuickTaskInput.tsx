import { useState, useRef, useEffect } from 'react';
import { useCreateTask } from './useTasks';
import { useTaskStore } from '../../stores';

interface QuickTaskInputProps {
  projectId: string | null;
}

export function QuickTaskInput({ projectId }: QuickTaskInputProps) {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const createTask = useCreateTask();
  const deactivateQuickInput = useTaskStore((s) => s.deactivateQuickInput);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      deactivateQuickInput();
      return;
    }

    await createTask.mutateAsync({
      title: title.trim(),
      projectId,
      status: 'backlog',
    });

    setTitle('');
    deactivateQuickInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      deactivateQuickInput();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex items-center gap-2 bg-white border border-indigo-300 rounded-lg p-2 shadow-sm ring-2 ring-indigo-100">
        <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="새 태스크 제목을 입력하세요..."
          className="flex-1 border-none focus:outline-none text-sm text-gray-900 placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={createTask.isPending}
          className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {createTask.isPending ? '...' : '추가'}
        </button>
      </div>
    </form>
  );
}
