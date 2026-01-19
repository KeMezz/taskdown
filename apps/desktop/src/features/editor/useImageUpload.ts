import { invoke } from '@tauri-apps/api/core';
import { nanoid } from 'nanoid';
import { useCallback } from 'react';
import type { Editor } from '@tiptap/core';
import { useAppStore } from '../../stores';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

export class ImageUploadError extends Error {
  constructor(
    message: string,
    public code: 'SIZE_EXCEEDED' | 'INVALID_FORMAT' | 'SAVE_FAILED',
    public filename?: string
  ) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

/**
 * 이미지 업로드 함수
 * @param file 업로드할 파일
 * @param vaultPath Vault 경로
 * @returns 저장된 이미지의 asset:// URL
 */
export async function uploadImage(file: File, vaultPath: string): Promise<string> {
  // 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    throw new ImageUploadError(
      `파일 크기가 10MB를 초과합니다 (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
      'SIZE_EXCEEDED',
      file.name
    );
  }

  // 파일 포맷 검증
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !ALLOWED_FORMATS.includes(ext)) {
    throw new ImageUploadError(
      `지원하지 않는 이미지 형식입니다. 지원 형식: ${ALLOWED_FORMATS.join(', ')}`,
      'INVALID_FORMAT',
      file.name
    );
  }

  const filename = `${nanoid()}.${ext}`;

  try {
    const buffer = await file.arrayBuffer();
    const bytes = Array.from(new Uint8Array(buffer));

    // Rust로 파일 저장 요청
    const url = await invoke<string>('save_asset', {
      filename,
      bytes,
      vaultPath,
    });

    return url;
  } catch (error) {
    throw new ImageUploadError(
      `이미지 저장에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      'SAVE_FAILED',
      file.name
    );
  }
}

/**
 * 이미지 업로드 결과 타입
 */
export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: ImageUploadError;
}

/**
 * 에디터에 이미지 삽입 훅
 */
export function useImageUpload(editor: Editor | null) {
  const vaultPath = useAppStore((state) => state.vaultPath);

  const handleImageUpload = useCallback(
    async (file: File): Promise<ImageUploadResult> => {
      if (!vaultPath) {
        return {
          success: false,
          error: new ImageUploadError('Vault가 초기화되지 않았습니다', 'SAVE_FAILED'),
        };
      }

      try {
        const url = await uploadImage(file, vaultPath);

        if (editor && !editor.isDestroyed) {
          editor.chain().focus().setImage({ src: url }).run();
        }

        return { success: true, url };
      } catch (error) {
        if (error instanceof ImageUploadError) {
          return { success: false, error };
        }
        return {
          success: false,
          error: new ImageUploadError(
            error instanceof Error ? error.message : '알 수 없는 오류',
            'SAVE_FAILED'
          ),
        };
      }
    },
    [editor, vaultPath]
  );

  const handleFilesUpload = useCallback(
    async (files: FileList | File[]): Promise<ImageUploadResult[]> => {
      const results: ImageUploadResult[] = [];

      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          const result = await handleImageUpload(file);
          results.push(result);
        }
      }

      return results;
    },
    [handleImageUpload]
  );

  return {
    handleImageUpload,
    handleFilesUpload,
  };
}

/**
 * 드래그앤드롭 이미지 업로드 훅
 */
export function useImageDrop(editor: Editor | null) {
  const { handleFilesUpload } = useImageUpload(editor);

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLElement>) => {
      const files = event.dataTransfer?.files;
      if (!files || files.length === 0) return;

      event.preventDefault();
      event.stopPropagation();

      const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        await handleFilesUpload(imageFiles);
      }
    },
    [handleFilesUpload]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return {
    handleDrop,
    handleDragOver,
  };
}

/**
 * 클립보드 이미지 붙여넣기 훅
 */
export function useImagePaste(editor: Editor | null) {
  const { handleFilesUpload } = useImageUpload(editor);

  const handlePaste = useCallback(
    async (event: React.ClipboardEvent<HTMLElement>) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        event.preventDefault();
        await handleFilesUpload(imageFiles);
      }
    },
    [handleFilesUpload]
  );

  return { handlePaste };
}
