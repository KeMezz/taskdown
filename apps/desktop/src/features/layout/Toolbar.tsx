import { forwardRef, useImperativeHandle, useRef } from 'react';

interface ToolbarProps {
  title: string;
  onNewTask?: () => void;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

export interface ToolbarHandle {
  focusSearch: () => void;
}

export const Toolbar = forwardRef<ToolbarHandle, ToolbarProps>(function Toolbar(
  { title, onNewTask, onSearch, searchPlaceholder = '검색...' },
  ref
) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focusSearch: () => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    },
  }));

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

      <div className="flex items-center gap-3">
        {/* 검색 */}
        {onSearch && (
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch(e.target.value)}
              className="w-64 pl-9 pr-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}

        {/* 새 태스크 버튼 */}
        {onNewTask && (
          <button
            onClick={onNewTask}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>새 태스크</span>
            <kbd className="hidden sm:inline-flex ml-1 px-1.5 py-0.5 text-xs bg-indigo-500 rounded">⌘N</kbd>
          </button>
        )}
      </div>
    </header>
  );
});
