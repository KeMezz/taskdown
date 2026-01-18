import { EditorContent } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import { useTaskEditor } from './useTaskEditor';

interface TaskEditorProps {
  content: string | JSONContent;
  onUpdate?: (content: JSONContent) => void;
  editable?: boolean;
  className?: string;
}

/**
 * 태스크 마크다운 에디터 컴포넌트
 * TipTap 기반 WYSIWYG 에디터
 */
export function TaskEditor({
  content,
  onUpdate,
  editable = true,
  className = '',
}: TaskEditorProps) {
  const editor = useTaskEditor({
    content,
    onUpdate,
    editable,
  });

  if (!editor) {
    return (
      <div className={`min-h-[200px] bg-gray-50 animate-pulse rounded-md ${className}`} />
    );
  }

  return (
    <div className={`task-editor ${className}`}>
      <EditorContent editor={editor} />
    </div>
  );
}
