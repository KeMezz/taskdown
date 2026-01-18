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

use tauri_plugin_sql::{Migration, MigrationKind};

#[tauri::command]
async fn run_sql(
    sql: String,
    params: Vec<serde_json::Value>,
    method: String,
    state: tauri::State<'_, DbState>,
) -> Result<Vec<serde_json::Value>, String> {
    // SQL 실행 로직
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

| 단축키 | 동작 | 컨텍스트 |
|--------|------|----------|
| `⌘ + N` | 새 태스크 (현재 프로젝트/Inbox) | 전역 |
| `⌘ + ⇧ + N` | 새 프로젝트 | 전역 |
| `⌘ + ,` | 설정 열기 | 전역 |
| `⌘ + F` | 검색 | 전역 |
| `Esc` | 패널/모달 닫기 | 패널/모달 열림 시 |
| `⌘ + Enter` | 태스크 저장 후 닫기 | 태스크 편집 시 |

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

```typescript
// features/editor/useImageUpload.ts

import { invoke } from '@tauri-apps/api/core';
import { nanoid } from 'nanoid';

export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const filename = `${nanoid()}.${ext}`;

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Rust로 파일 저장 요청
  await invoke('save_asset', {
    filename,
    bytes: Array.from(bytes),
  });

  // 로컬 경로 반환 (asset:// 프로토콜)
  return `asset://localhost/${filename}`;
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
