import { useState, useRef } from 'react';

interface QuickTaskInputProps {
  onSubmit: (title: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function QuickTaskInput({
  onSubmit,
  placeholder = '새 태스크 추가...',
  autoFocus = false,
}: QuickTaskInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    onSubmit(trimmed);
    setValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setValue('');
      inputRef.current?.blur();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="flex-1 outline-none text-sm placeholder:text-gray-400"
          autoComplete="off"
        />
        {value.trim() && (
          <button
            type="submit"
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            추가
          </button>
        )}
      </div>
    </form>
  );
}
