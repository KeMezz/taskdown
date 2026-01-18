import { useEditor } from '@tiptap/react';
import type { Editor, JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useCallback, useEffect, useRef } from 'react';

const lowlight = createLowlight(common);

interface UseTaskEditorOptions {
  content: string | JSONContent;
  onUpdate?: (content: JSONContent) => void;
  editable?: boolean;
}

/**
 * TipTap 에디터 훅
 * StarterKit + TaskList + TaskItem + Image + CodeBlockLowlight 구성
 */
export function useTaskEditor({
  content,
  onUpdate,
  editable = true,
}: UseTaskEditorOptions): Editor | null {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // CodeBlockLowlight 사용
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: 'task-image max-w-full rounded-md',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded-md bg-gray-900 text-gray-100 p-4 text-sm overflow-x-auto',
        },
      }),
    ],
    content: parseContent(content),
    editable,
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none min-h-[200px] max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      onUpdateRef.current?.(editor.getJSON());
    },
  });

  // content가 외부에서 변경되면 에디터 내용 업데이트
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const newContent = parseContent(content);
      const currentContent = editor.getJSON();

      // 내용이 다를 때만 업데이트 (무한 루프 방지)
      if (JSON.stringify(newContent) !== JSON.stringify(currentContent)) {
        editor.commands.setContent(newContent);
      }
    }
  }, [content, editor]);

  // editable 상태 업데이트
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  return editor;
}

/**
 * content를 JSONContent로 파싱
 */
function parseContent(content: string | JSONContent): JSONContent {
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      // 빈 객체인 경우 기본 문서 구조 반환
      if (Object.keys(parsed).length === 0) {
        return getEmptyDocument();
      }
      return parsed;
    } catch {
      // 파싱 실패 시 텍스트로 취급
      if (content.trim()) {
        return {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: content }],
            },
          ],
        };
      }
      return getEmptyDocument();
    }
  }
  return content;
}

/**
 * 빈 문서 구조
 */
function getEmptyDocument(): JSONContent {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
      },
    ],
  };
}

/**
 * 에디터 포커스 훅
 */
export function useFocusEditor(editor: Editor | null) {
  return useCallback(() => {
    if (editor && !editor.isDestroyed) {
      editor.commands.focus('end');
    }
  }, [editor]);
}
