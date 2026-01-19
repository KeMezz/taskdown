import { useState, useEffect, useRef, useCallback } from 'react';
import type { Task, Project, TaskStatus } from '@taskdown/db';
import type { JSONContent } from '@tiptap/core';
import {
  useTaskEditor,
  useImageDrop,
  useImagePaste,
  useAutoSave,
  getSaveStatusText,
  getSaveStatusColor,
} from '../editor';
import { EditorContent } from '@tiptap/react';

interface TaskDetailPanelProps {
  task: Task;
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: {
    title?: string;
    projectId?: string | null;
    dueDate?: Date | null;
    status?: TaskStatus;
    content?: string;
  }) => void;
  onDelete: () => void;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'next', label: 'Next' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'done', label: 'Done' },
];

export function TaskDetailPanel({
  task,
  projects,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: TaskDetailPanelProps) {
  const [title, setTitle] = useState(task.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // 자동 저장 핸들러
  const handleSaveContent = useCallback(
    async (content: JSONContent) => {
      onUpdate({ content: JSON.stringify(content) });
    },
    [onUpdate]
  );

  const { status: saveStatus, debouncedSave, flushSave } = useAutoSave({
    onSave: handleSaveContent,
    debounceMs: 500,
  });

  // 패널 닫기 전 저장 플러시
  const handleClose = useCallback(async () => {
    try {
      await flushSave();
      onClose();
    } catch (error) {
      console.error('Failed to save before closing:', error);
      const shouldClose = window.confirm(
        '변경 사항을 저장하는 데 실패했습니다. 그래도 닫으시겠습니까?'
      );
      if (shouldClose) {
        onClose();
      }
    }
  }, [flushSave, onClose]);

  // 에디터 콘텐츠 업데이트 핸들러
  const handleEditorUpdate = useCallback(
    (content: JSONContent) => {
      debouncedSave(content);
    },
    [debouncedSave]
  );

  // TipTap 에디터
  const editor = useTaskEditor({
    content: task.content ?? '{}',
    onUpdate: handleEditorUpdate,
    editable: true,
  });

  // 이미지 드래그앤드롭
  const { handleDrop, handleDragOver } = useImageDrop(editor);

  // 이미지 클립보드 붙여넣기
  const { handlePaste } = useImagePaste(editor);

  // task가 변경되면 title 업데이트
  useEffect(() => {
    setTitle(task.title);
  }, [task.title]);

  // ESC 키로 닫기 (에디터가 포커스되지 않은 경우에만)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        // 에디터가 포커스된 상태면 먼저 에디터 포커스 해제
        if (editor?.isFocused) {
          editor.commands.blur();
          return;
        }
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, editor]);

  // 바깥 클릭으로 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        isOpen
      ) {
        handleClose();
      }
    };

    // 약간의 지연을 줘서 드래그 완료 후 클릭과 구분
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClose]);

  // 제목 편집 시 포커스
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title.trim() && title !== task.title) {
      onUpdate({ title: title.trim() });
    } else {
      setTitle(task.title);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setTitle(task.title);
      setIsEditingTitle(false);
    }
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onUpdate({ projectId: value === '' ? null : value });
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onUpdate({ dueDate: value ? new Date(value) : null });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ status: e.target.value as TaskStatus });
  };

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0] ?? '';
  };

  const formatDateTime = (date: Date | null): string => {
    if (!date) return '-';
    return new Date(date).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 transition-opacity" />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-lg bg-white shadow-xl animate-slide-in-right h-full overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-gray-500">태스크 상세</h2>
            {saveStatus !== 'idle' && (
              <span className={`text-xs ${getSaveStatusColor(saveStatus)}`}>
                {getSaveStatusText(saveStatus)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDelete}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="삭제"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="닫기 (Esc)"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Title */}
          <div>
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="w-full text-xl font-semibold text-gray-900 px-2 py-1 border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className={`text-xl font-semibold cursor-pointer px-2 py-1 rounded hover:bg-gray-100 transition-colors ${
                  task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'
                }`}
              >
                {task.title}
              </h1>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center gap-3">
              <label className="w-20 text-sm text-gray-500">상태</label>
              <select
                value={task.status ?? 'backlog'}
                onChange={handleStatusChange}
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Project */}
            <div className="flex items-center gap-3">
              <label className="w-20 text-sm text-gray-500">프로젝트</label>
              <select
                value={task.projectId ?? ''}
                onChange={handleProjectChange}
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Inbox</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-3">
              <label className="w-20 text-sm text-gray-500">마감일</label>
              <input
                type="date"
                value={formatDateForInput(task.dueDate)}
                onChange={handleDueDateChange}
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Editor */}
          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm text-gray-500 mb-2">메모</label>
            <div
              ref={editorContainerRef}
              className="task-editor min-h-[200px] bg-white border border-gray-200 rounded-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onPaste={handlePaste}
            >
              {editor ? (
                <EditorContent editor={editor} />
              ) : (
                <div className="min-h-[200px] p-3 animate-pulse bg-gray-50" />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>생성: {formatDateTime(task.createdAt)}</span>
            <span>수정: {formatDateTime(task.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
