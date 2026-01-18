# Design: add-taskdown-mvp

## Overview

이 문서는 Taskdown MVP의 기술적 설계 결정을 기록한다.

> 상세 결정 근거: [ADRs](../../adrs/README.md)

## 0. 모노레포 구조

> [ADR-007: 모노레포 구조](../../adrs/007-monorepo-structure.md)

### 패키지 구조

```
taskdown/
├── pnpm-workspace.yaml
├── package.json                    # 루트 (scripts, devDependencies)
├── apps/
│   └── desktop/                    # Tauri 데스크톱 앱
│       ├── package.json            # @taskdown/desktop
│       ├── src-tauri/              # Rust 백엔드
│       │   ├── Cargo.toml
│       │   └── src/
│       └── src/                    # React 앱 진입점
│           ├── App.tsx
│           ├── main.tsx
│           └── features/           # 앱 전용 기능
├── packages/
│   ├── ui/                         # @taskdown/ui
│   │   ├── package.json
│   │   └── src/
│   │       ├── components/         # Button, Input, Card, Modal 등
│   │       ├── hooks/              # useDebounce, useKeyboardShortcut 등
│   │       └── index.ts
│   └── db/                         # @taskdown/db
│       ├── package.json
│       └── src/
│           ├── schema.ts           # Drizzle 스키마
│           ├── types.ts            # Task, Project, Reminder 타입
│           ├── migrations/         # 마이그레이션 SQL
│           └── index.ts
└── tooling/                        # 공유 설정 (선택적)
    ├── eslint/
    ├── typescript/
    └── tailwind/
```

### 워크스페이스 설정

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"
```

### 패키지 의존성

```
@taskdown/desktop
├── @taskdown/ui (workspace:*)
└── @taskdown/db (workspace:*)

@taskdown/ui
└── (외부 의존성만)

@taskdown/db
└── drizzle-orm
```

### 공유 스크립트

```json
// 루트 package.json
{
  "name": "taskdown",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter @taskdown/desktop dev",
    "build": "pnpm --filter @taskdown/desktop build",
    "build:all": "pnpm -r build",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck",
    "clean": "pnpm -r clean"
  }
}
```

## 1. 데이터베이스 스키마

### ERD

```
┌─────────────────┐       ┌─────────────────┐
│    projects     │       │     tasks       │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)         │
│ name            │   │   │ title           │
│ color           │   │   │ content (JSON)  │
│ icon            │   └──<│ project_id (FK) │
│ sort_order      │       │ status          │
│ created_at      │       │ due_date        │
│ updated_at      │       │ sort_order      │
└─────────────────┘       │ created_at      │
                          │ updated_at      │
                          └─────────────────┘

┌─────────────────┐
│   reminders     │
├─────────────────┤
│ id (PK)         │
│ task_id (FK)    │───> tasks.id
│ remind_at       │
│ is_sent         │
│ created_at      │
└─────────────────┘
```

### Drizzle Schema

```typescript
// packages/db/src/schema.ts

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(), // nanoid
  name: text('name').notNull(),
  color: text('color').default('#6366f1'),
  icon: text('icon'),
  sortOrder: integer('sort_order').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(), // nanoid
  title: text('title').notNull(),
  content: text('content').default('{}'), // TipTap JSON
  projectId: text('project_id').references(() => projects.id, {
    onDelete: 'set null',
  }),
  status: text('status', {
    enum: ['backlog', 'next', 'waiting', 'done'],
  }).default('backlog'),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  sortOrder: integer('sort_order').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const reminders = sqliteTable('reminders', {
  id: text('id').primaryKey(), // nanoid
  taskId: text('task_id')
    .references(() => tasks.id, { onDelete: 'cascade' })
    .notNull(),
  remindAt: integer('remind_at', { mode: 'timestamp' }).notNull(),
  isSent: integer('is_sent', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 마이그레이션 버전 관리 테이블
export const migrations = sqliteTable('migrations', {
  version: integer('version').primaryKey(),
  name: text('name').notNull(),
  appliedAt: integer('applied_at', { mode: 'timestamp' }).notNull(),
});
```

### Status 매핑

| Status | 칸반 컬럼 | 설명 |
|--------|-----------|------|
| `backlog` | Backlog | 언젠가 할 일, 미정리 |
| `next` | Next | 다음에 할 일, 액션 가능 |
| `waiting` | Waiting | 대기 중 (다른 사람/조건) |
| `done` | Done | 완료 |

## 2. Drizzle Proxy 패턴

Tauri 환경에서 Drizzle ORM을 사용하기 위한 Proxy 패턴:

```typescript
// src/db/database.ts

import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { invoke } from '@tauri-apps/api/core';
import * as schema from './schema';

export const db = drizzle(
  async (sql, params, method) => {
    try {
      const result = await invoke<unknown[]>('run_sql', {
        sql,
        params,
        method, // 'run' | 'all' | 'get'
      });
      return { rows: result };
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  },
  { schema }
);
```

### Rust Backend

```rust
// src-tauri/src/lib.rs

use rusqlite::{params_from_iter, Connection, Result as SqliteResult};
use serde_json::{json, Value};
use std::sync::Mutex;
use tauri::State;

pub struct DbState(pub Mutex<Connection>);

#[tauri::command]
async fn run_sql(
    sql: String,
    params: Vec<Value>,
    method: String,
    state: State<'_, DbState>,
) -> Result<Value, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    // JSON Value를 rusqlite 파라미터로 변환
    let sqlite_params: Vec<Box<dyn rusqlite::ToSql>> = params
        .iter()
        .map(|v| -> Box<dyn rusqlite::ToSql> {
            match v {
                Value::Null => Box::new(rusqlite::types::Null),
                Value::Bool(b) => Box::new(*b),
                Value::Number(n) => {
                    if let Some(i) = n.as_i64() {
                        Box::new(i)
                    } else if let Some(f) = n.as_f64() {
                        Box::new(f)
                    } else {
                        Box::new(rusqlite::types::Null)
                    }
                }
                Value::String(s) => Box::new(s.clone()),
                _ => Box::new(v.to_string()),
            }
        })
        .collect();

    match method.as_str() {
        // INSERT, UPDATE, DELETE
        "run" => {
            let affected = conn
                .execute(&sql, params_from_iter(sqlite_params.iter().map(|p| p.as_ref())))
                .map_err(|e| e.to_string())?;
            Ok(json!({ "changes": affected }))
        }
        // SELECT 단일 행
        "get" => {
            let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
            let columns: Vec<String> = stmt.column_names().iter().map(|s| s.to_string()).collect();
            let row = stmt
                .query_row(params_from_iter(sqlite_params.iter().map(|p| p.as_ref())), |row| {
                    let mut obj = serde_json::Map::new();
                    for (i, col) in columns.iter().enumerate() {
                        let value: Value = row.get(i).unwrap_or(Value::Null);
                        obj.insert(col.clone(), value);
                    }
                    Ok(Value::Object(obj))
                })
                .map_err(|e| e.to_string())?;
            Ok(row)
        }
        // SELECT 다중 행
        "all" => {
            let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
            let columns: Vec<String> = stmt.column_names().iter().map(|s| s.to_string()).collect();
            let rows = stmt
                .query_map(params_from_iter(sqlite_params.iter().map(|p| p.as_ref())), |row| {
                    let mut obj = serde_json::Map::new();
                    for (i, col) in columns.iter().enumerate() {
                        let value: Value = row.get(i).unwrap_or(Value::Null);
                        obj.insert(col.clone(), value);
                    }
                    Ok(Value::Object(obj))
                })
                .map_err(|e| e.to_string())?
                .filter_map(|r| r.ok())
                .collect::<Vec<_>>();
            Ok(Value::Array(rows))
        }
        _ => Err(format!("Unknown method: {}", method)),
    }
}
```

## 3. Vault 구조

```
[User Selected Vault]/
├── .taskdown/
│   ├── data.db          # SQLite 데이터베이스
│   ├── config.json      # 앱 설정
│   └── assets/          # 이미지, 첨부파일
│       └── {nanoid}.{ext}
└── .gitignore           # 자동 생성 (선택적)
```

### Config Schema

```typescript
interface TaskdownConfig {
  version: string;           // "1.0.0"
  theme: 'light' | 'dark' | 'system';
  defaultReminderTime: string;  // "09:00"
  createdAt: string;         // ISO 8601
}
```

## 4. 상태 관리

### Zustand Stores

```typescript
// stores/appStore.ts
interface AppState {
  vaultPath: string | null;
  isInitialized: boolean;
  setVaultPath: (path: string) => void;
}

// stores/taskStore.ts
interface TaskState {
  selectedTaskId: string | null;
  selectTask: (id: string | null) => void;
}

// stores/sidebarStore.ts
interface SidebarState {
  selectedProjectId: string | null;  // null = Inbox
  selectProject: (id: string | null) => void;
}
```

### React Query Keys

```typescript
const queryKeys = {
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  tasks: (projectId: string | null) => ['tasks', { projectId }] as const,
  task: (id: string) => ['tasks', id] as const,
  inboxTasks: ['tasks', { projectId: null }] as const,
};
```

## 5. UI 레이아웃

```
┌─────────────────────────────────────────────────────────┐
│  Title Bar (Tauri window controls)                      │
├──────────┬──────────────────────────────────────────────┤
│          │  Toolbar                                     │
│          │  ┌─────────────────────────────────────────┐ │
│          │  │ 🔍 Search          [+ New Task] (⌘N)   │ │
│          │  └─────────────────────────────────────────┘ │
│ Sidebar  ├──────────────────────────────────────────────┤
│ (240px)  │                                              │
│ ───────  │  Main Content Area                           │
│ 📥 Inbox │                                              │
│ ───────  │  ┌──────────┬──────────┬──────────┬────────┐ │
│ Projects │  │ Backlog  │  Next    │ Waiting  │  Done  │ │
│  📁 Proj1│  │  (12)    │   (5)    │   (3)    │  (28)  │ │
│  📁 Proj2│  ├──────────┼──────────┼──────────┼────────┤ │
│          │  │ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │        │ │
│ ───────  │  │ │Task 1│ │ │Task 4│ │ │Task 7│ │        │ │
│ ⚙ 설정  │  │ └──────┘ │ └──────┘ │ └──────┘ │        │ │
│          │  │ ┌──────┐ │          │          │        │ │
│          │  │ │Task 2│ │          │          │        │ │
│          │  │ └──────┘ │          │          │        │ │
│          │  └──────────┴──────────┴──────────┴────────┘ │
└──────────┴──────────────────────────────────────────────┘
```

### 태스크 상세 패널 (사이드 슬라이드)

```
┌─────────────────────────────────────────────────────────┐
│                                              │ ✕ Close │
├─────────────────────────────────────────────────────────┤
│  Task Title (editable)                                  │
├─────────────────────────────────────────────────────────┤
│  📁 Project: [Dropdown]     📅 Due: [Date Picker]      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │            TipTap Editor                        │   │
│  │                                                 │   │
│  │  - Markdown content                             │   │
│  │  - Checklists                                   │   │
│  │  - Code blocks                                  │   │
│  │  - Images                                       │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Created: 2026-01-15    Modified: 2026-01-18           │
└─────────────────────────────────────────────────────────┘
```

## 6. 키보드 단축키

### 플랫폼별 매핑

| 동작 | macOS | Windows/Linux | 컨텍스트 |
|------|-------|---------------|----------|
| 새 태스크 (현재 프로젝트/Inbox) | `⌘ + N` | `Ctrl + N` | 전역 |
| 새 프로젝트 | `⌘ + ⇧ + N` | `Ctrl + Shift + N` | 전역 |
| 설정 열기 | `⌘ + ,` | `Ctrl + ,` | 전역 |
| 검색 | `⌘ + F` | `Ctrl + F` | 전역 |
| 패널/모달 닫기 | `Esc` | `Esc` | 패널/모달 열림 시 |
| 태스크 저장 후 닫기 | `⌘ + Enter` | `Ctrl + Enter` | 태스크 편집 시 |

### 구현 예시

```typescript
// packages/ui/src/hooks/useKeyboardShortcut.ts

import { useEffect } from 'react';

type Modifier = 'meta' | 'ctrl' | 'shift' | 'alt';

interface ShortcutOptions {
  key: string;
  modifiers?: Modifier[];
  callback: () => void;
  enabled?: boolean;
}

function isMac() {
  return navigator.platform.toUpperCase().includes('MAC');
}

export function useKeyboardShortcut({
  key,
  modifiers = [],
  callback,
  enabled = true,
}: ShortcutOptions) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      const isModifierMatch = modifiers.every((mod) => {
        switch (mod) {
          case 'meta':
            // macOS: Cmd, Windows/Linux: Ctrl
            return isMac() ? event.metaKey : event.ctrlKey;
          case 'ctrl':
            return event.ctrlKey;
          case 'shift':
            return event.shiftKey;
          case 'alt':
            return event.altKey;
          default:
            return false;
        }
      });

      if (isModifierMatch && event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault();
        callback();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, modifiers, callback, enabled]);
}
```

### TipTap 단축키와의 충돌 방지

TipTap 에디터 내부에서는 에디터 기본 단축키가 우선됩니다:
- `⌘/Ctrl + B`: 볼드
- `⌘/Ctrl + I`: 이탤릭
- `⌘/Ctrl + Enter`: 전역 단축키 (에디터 외부에서만 동작)

## 7. TipTap 에디터 설정

```typescript
// features/editor/useTaskEditor.ts

import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);

export function useTaskEditor(content: JSONContent) {
  return useEditor({
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
          class: 'task-image',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none min-h-[200px]',
      },
    },
  });
}
```

## 8. 이미지 처리

### 이미지 업로드 제한

| 항목 | 제한 |
|------|------|
| 최대 파일 크기 | 10MB |
| 지원 포맷 | jpg, jpeg, png, gif, webp |
| 파일명 | nanoid (21자) + 확장자 |

### 구현

```typescript
// features/editor/useImageUpload.ts

import { invoke } from '@tauri-apps/api/core';
import { nanoid } from 'nanoid';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

export class ImageUploadError extends Error {
  constructor(
    message: string,
    public code: 'SIZE_EXCEEDED' | 'INVALID_FORMAT' | 'SAVE_FAILED'
  ) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

export async function uploadImage(file: File): Promise<string> {
  // 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    throw new ImageUploadError(
      `파일 크기가 10MB를 초과합니다 (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
      'SIZE_EXCEEDED'
    );
  }

  // 파일 포맷 검증
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !ALLOWED_FORMATS.includes(ext)) {
    throw new ImageUploadError(
      `지원하지 않는 이미지 형식입니다. 지원 형식: ${ALLOWED_FORMATS.join(', ')}`,
      'INVALID_FORMAT'
    );
  }

  const filename = `${nanoid()}.${ext}`;

  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Rust로 파일 저장 요청
    await invoke('save_asset', {
      filename,
      bytes: Array.from(bytes),
    });

    // 로컬 경로 반환 (asset:// 프로토콜)
    return `asset://localhost/${filename}`;
  } catch (error) {
    throw new ImageUploadError(
      `이미지 저장에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      'SAVE_FAILED'
    );
  }
}
```

### 에러 처리 UI

```typescript
// features/editor/ImageUploadHandler.tsx

import { toast } from 'sonner'; // 또는 다른 토스트 라이브러리

export function handleImageUploadError(error: unknown) {
  if (error instanceof ImageUploadError) {
    switch (error.code) {
      case 'SIZE_EXCEEDED':
        toast.error('이미지가 너무 큽니다', {
          description: error.message,
        });
        break;
      case 'INVALID_FORMAT':
        toast.error('지원하지 않는 형식', {
          description: error.message,
        });
        break;
      case 'SAVE_FAILED':
        toast.error('저장 실패', {
          description: error.message,
        });
        break;
    }
  } else {
    toast.error('이미지 업로드 실패');
  }
}
```

## 9. 알림 스케줄링

```typescript
// features/notifications/reminderScheduler.ts

import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';

export async function checkAndSendReminders() {
  const granted = await isPermissionGranted();
  if (!granted) {
    const permission = await requestPermission();
    if (permission !== 'granted') return;
  }

  const pendingReminders = await db.query.reminders.findMany({
    where: (r, { and, eq, lte }) =>
      and(eq(r.isSent, false), lte(r.remindAt, new Date())),
    with: { task: true },
  });

  for (const reminder of pendingReminders) {
    await sendNotification({
      title: 'Taskdown',
      body: `마감: ${reminder.task.title}`,
    });

    await db.update(reminders)
      .set({ isSent: true })
      .where(eq(reminders.id, reminder.id));
  }
}
```

## 10. 의사결정 기록

### ID 생성: nanoid 선택

- **선택**: nanoid
- **이유**:
  - UUID보다 짧음 (21자 vs 36자)
  - URL-safe 문자만 사용
  - 충돌 확률 충분히 낮음

### 콘텐츠 저장: TipTap JSON

- **선택**: TipTap JSON 형식
- **이유**:
  - TipTap 네이티브 포맷으로 변환 불필요
  - 구조화된 데이터로 검색/조작 용이
  - 향후 Markdown 내보내기 가능

### 마이그레이션: 앱 시작 시 자동 실행

- **선택**: 앱 시작 시 마이그레이션 체크
- **이유**:
  - 사용자 개입 없이 스키마 업그레이드
  - 버전 테이블로 중복 실행 방지

#### 마이그레이션 전략 상세

**실행 흐름**:
1. 앱 시작 시 `migrations` 테이블 존재 여부 확인
2. 현재 적용된 최신 버전 조회
3. 미적용 마이그레이션 순차 실행 (트랜잭션 단위)
4. 각 마이그레이션 완료 시 `migrations` 테이블에 기록

**실패 처리**:
- 마이그레이션 실패 시 해당 트랜잭션 롤백
- 에러 로그 저장 후 사용자에게 알림 표시
- 앱은 읽기 전용 모드로 동작 (데이터 보호)

**롤백 전략**:
- 각 마이그레이션은 `up`/`down` 함수 쌍으로 구현
- 수동 롤백: 설정 → 고급 → 마이그레이션 롤백
- 자동 롤백은 지원하지 않음 (데이터 무결성 우선)

**데이터 백업**:
- 마이그레이션 실행 전 `data.db.backup` 자동 생성
- 백업 파일은 최근 3개 유지 (이전 백업 자동 삭제)
