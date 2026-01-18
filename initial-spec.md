# Taskdown MVP 사양서

> **버전**: 0.1.0 (Draft)  
> **최종 수정**: 2025-01-17  
> **상태**: MVP 기획 단계

---

## 1. 프로젝트 개요

### 1.1 앱 이름
**Taskdown** (가칭) — Task + Markdown

### 1.2 한 줄 정의
GTD 기반 할 일 관리와 마크다운 노트를 결합한 로컬 우선 생산성 앱

### 1.3 해결하는 문제

| 기존 도구 | 문제점 | Taskdown의 해결 |
|-----------|--------|-----------------|
| Todoist | 태스크에 충분한 맥락/문서를 담기 어려움 | 각 태스크에 풍부한 마크다운 노트 |
| Obsidian | 푸시 알림 없음, 할 일 관리 UX 불편, 플러그인 파편화 | 네이티브 알림 + 칸반 기반 태스크 관리 |
| 두 앱 병행 | 컨텍스트 스위칭 비용, 데이터 분산 | 하나의 앱에서 통합 관리 |

### 1.4 핵심 가치
- **로컬 우선**: 데이터는 사용자 소유, Git으로 버전 관리 가능
- **단순함**: 플러그인 없이 핵심 기능만 잘 동작
- **GTD 철학**: Inbox → 프로젝트 → 실행의 자연스러운 흐름

---

## 2. 타겟 사용자

### 2.1 Primary Persona
- 개인 생산성에 관심 있는 개발자/지식 노동자
- GTD 또는 유사한 생산성 방법론 실천자
- 데이터 소유권과 프라이버시를 중시하는 사용자
- Todoist, Obsidian, Notion 등을 사용해본 경험 있음

### 2.2 MVP 제외 대상
- 팀 협업이 필요한 사용자
- 모바일 중심 사용자 (Phase 2 대응)

---

## 3. MVP 기능 범위 (Phase 1)

### 3.1 태스크 관리

#### 3.1.1 Global Inbox
- 모든 할 일의 진입점
- 빠른 태스크 추가 (제목만으로 생성)
- 프로젝트 미지정 태스크 목록
- 프로젝트로 이동/할당

#### 3.1.2 프로젝트
- 프로젝트 CRUD (생성, 조회, 수정, 삭제)
- 프로젝트 목록 사이드바
- 프로젝트별 색상/아이콘 지정

#### 3.1.3 칸반 보드
- 고정 4컬럼 구조: **Backlog** → **Next** → **Waiting** → **Done**
- 드래그 앤 드롭으로 컬럼 간 이동
- 컬럼 내 태스크 순서 변경
- 컬럼별 태스크 카운트 표시

#### 3.1.4 태스크
- 태스크 CRUD
- 필드:
  - 제목 (필수)
  - 마감일 (선택)
  - 프로젝트 (선택, 미지정 시 Inbox)
  - 상태 (칸반 컬럼에 매핑)
  - 생성일/수정일 (자동)
- 태스크 상세 모달/패널

### 3.2 마크다운 노트

#### 3.2.1 에디터
- WYSIWYG 스타일 (TipTap 기반)
- 각 태스크당 1개의 노트
- 실시간 저장 (디바운스)

#### 3.2.2 지원 문법
- 헤딩 (H1-H6)
- Bold, Italic, Strikethrough
- 순서 있는/없는 리스트
- 체크리스트
- 코드 블록 (신택스 하이라이팅)
- 인라인 코드
- 링크
- 이미지 (로컬 파일 삽입)
- 인용문
- 수평선

#### 3.2.3 제외 (Phase 2+)
- 태스크 간 링크/백링크
- 태스크 내 복수 페이지
- 수식 (LaTeX)
- 다이어그램 (Mermaid)

### 3.3 알림

#### 3.3.1 마감일 알림
- 마감일 설정된 태스크에 대해 OS 네이티브 알림
- 기본 알림 시점: 마감일 당일 오전 9시
- 커스텀 알림 시간 설정

#### 3.3.2 제외 (Phase 2+)
- AI 기반 아침/저녁 의식
- 스마트 리마인더

### 3.4 데이터 저장

#### 3.4.1 저장 방식
- 사용자가 Vault 폴더 선택
- SQLite 데이터베이스 파일 (`.taskdown/data.db`)
- 이미지/첨부파일: `.taskdown/assets/` 폴더
- Git 친화적 구조

#### 3.4.2 폴더 구조
```
[User Selected Vault]/
├── .taskdown/
│   ├── data.db          # SQLite 데이터베이스
│   ├── config.json      # 앱 설정
│   └── assets/          # 이미지, 첨부파일
│       └── {uuid}.{ext}
└── .gitignore           # 자동 생성 (선택적)
```

#### 3.4.3 제외 (Phase 2+)
- 클라우드 동기화
- 멀티 디바이스 동기화

### 3.5 UI/UX

#### 3.5.1 레이아웃
```
┌─────────────────────────────────────────────────────────┐
│  Title Bar (Tauri window controls)                      │
├──────────┬──────────────────────────────────────────────┤
│          │  Toolbar (검색, 빠른 추가)                   │
│          ├──────────────────────────────────────────────┤
│ Sidebar  │                                              │
│ ───────  │  Main Content Area                           │
│ Inbox    │  (칸반 보드 또는 태스크 상세)                │
│ Projects │                                              │
│  - Proj1 │                                              │
│  - Proj2 │                                              │
│          │                                              │
│          │                                              │
│ Settings │                                              │
└──────────┴──────────────────────────────────────────────┘
```

#### 3.5.2 핵심 화면
1. **Inbox 뷰**: 미분류 태스크 리스트
2. **프로젝트 칸반 뷰**: 4컬럼 칸반 보드
3. **태스크 상세 뷰**: 사이드 패널 또는 모달
4. **설정**: Vault 경로, 알림 설정

#### 3.5.3 단축키 (MVP 필수)
| 단축키 | 동작 |
|--------|------|
| `Cmd + N` | 새 태스크 (Inbox) |
| `Cmd + Shift + N` | 새 프로젝트 |
| `Cmd + ,` | 설정 열기 |
| `Cmd + F` | 검색 |
| `Esc` | 패널/모달 닫기 |

---

## 4. 기술 스택

### 4.1 아키텍처 다이어그램
```
┌─────────────────────────────────────────────────────────┐
│                    Tauri 2.0 Shell                      │
│                    (macOS App)                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │              React Frontend (WebView)           │   │
│   │  ┌─────────────────────────────────────────┐    │   │
│   │  │          Presentation Layer             │    │   │
│   │  │   React + TipTap + dnd-kit + Zustand    │    │   │
│   │  └─────────────────────────────────────────┘    │   │
│   │                      │                          │   │
│   │  ┌─────────────────────────────────────────┐    │   │
│   │  │          Repository Layer               │    │   │
│   │  │   TaskRepository, ProjectRepository     │    │   │
│   │  │   (Interface 기반, 향후 교체 용이)      │    │   │
│   │  └─────────────────────────────────────────┘    │   │
│   │                      │                          │   │
│   │  ┌─────────────────────────────────────────┐    │   │
│   │  │          Data Layer                     │    │   │
│   │  │   Drizzle ORM + SQLite (via Tauri)      │    │   │
│   │  └─────────────────────────────────────────┘    │   │
│   └─────────────────────────────────────────────────┘   │
│                          │                              │
│   ┌──────────────────────┴──────────────────────────┐   │
│   │              Tauri Rust Backend                 │   │
│   │   - SQLite 파일 시스템 접근                     │   │
│   │   - OS 네이티브 알림                            │   │
│   │   - 파일 다이얼로그                             │   │
│   └─────────────────────────────────────────────────┘   │
│                          │                              │
└──────────────────────────┼──────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │    Local File System    │
              │    (User's Vault)       │
              └─────────────────────────┘
```

### 4.2 기술 스택 상세

| 레이어 | 기술 | 비고 |
|--------|------|------|
| **Desktop Shell** | Tauri 2.0 | macOS 우선, 향후 Windows/Linux |
| **Frontend** | React 18 + TypeScript | |
| **빌드** | Vite 5 | 빠른 HMR |
| **스타일링** | Tailwind CSS 4 | |
| **상태관리** | Zustand | 단순함, 보일러플레이트 최소 |
| **서버 상태** | @tanstack/react-query | 캐싱, 동기화 (로컬 DB지만 유용) |
| **마크다운 에디터** | TipTap | WYSIWYG, 확장성 |
| **드래그앤드롭** | dnd-kit | 칸반 보드용 |
| **ORM** | Drizzle ORM | 타입 안전, 가벼움 |
| **DB** | SQLite | better-sqlite3 via Tauri SQL plugin |
| **알림** | Tauri Notification Plugin | OS 네이티브 |

### 4.3 핵심 의존성

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-sql": "^2.0.0",
    "@tauri-apps/plugin-notification": "^2.0.0",
    "@tauri-apps/plugin-dialog": "^2.0.0",
    "@tiptap/react": "^2.6.0",
    "@tiptap/starter-kit": "^2.6.0",
    "@tiptap/extension-task-list": "^2.6.0",
    "@tiptap/extension-task-item": "^2.6.0",
    "@tiptap/extension-image": "^2.6.0",
    "@tiptap/extension-code-block-lowlight": "^2.6.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "drizzle-orm": "^0.33.0",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.50.0"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^4.0.0",
    "drizzle-kit": "^0.24.0"
  }
}
```

---

## 5. 데이터 모델

### 5.1 ERD
```
┌─────────────────┐       ┌─────────────────┐
│    projects     │       │     tasks       │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)         │
│ name            │   │   │ title           │
│ color           │   │   │ content         │  ← 마크다운
│ icon            │   └──<│ project_id (FK) │
│ created_at      │       │ status          │  ← 칸반 컬럼
│ updated_at      │       │ due_date        │
│ sort_order      │       │ sort_order      │
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

### 5.2 Drizzle Schema

```typescript
// src/db/schema.ts

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(), // UUID
  name: text('name').notNull(),
  color: text('color').default('#6366f1'),
  icon: text('icon'),
  sortOrder: integer('sort_order').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(), // UUID
  title: text('title').notNull(),
  content: text('content').default(''), // 마크다운/JSON
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
  id: text('id').primaryKey(),
  taskId: text('task_id')
    .references(() => tasks.id, { onDelete: 'cascade' })
    .notNull(),
  remindAt: integer('remind_at', { mode: 'timestamp' }).notNull(),
  isSent: integer('is_sent', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
```

### 5.3 Status 값 매핑

| Status | 칸반 컬럼 | 설명 |
|--------|-----------|------|
| `backlog` | Backlog | 언젠가 할 일, 미정리 |
| `next` | Next | 다음에 할 일, 액션 가능 |
| `waiting` | Waiting | 대기 중 (다른 사람/조건) |
| `done` | Done | 완료 |

---

## 6. Phase 로드맵

### Phase 1: MVP (현재 문서 범위)
**목표**: 로컬에서 동작하는 핵심 기능 완성

- [ ] Tauri + React 프로젝트 셋업
- [ ] SQLite + Drizzle ORM 연동
- [ ] Vault 폴더 선택 기능
- [ ] 프로젝트 CRUD
- [ ] 태스크 CRUD
- [ ] Inbox 뷰
- [ ] 칸반 보드 (드래그앤드롭)
- [ ] TipTap 마크다운 에디터
- [ ] 이미지 삽입
- [ ] 마감일 알림
- [ ] 기본 단축키

**예상 기간**: 4-6주

---

### Phase 1.5: 모바일 열람용
**목표**: 언제 어디서든 태스크 확인 및 간단한 수정

- [ ] Tauri 2.0 Mobile (iOS) 또는 PWA
- [ ] 읽기 전용 뷰 우선
- [ ] 간단한 태스크 추가/수정
- [ ] 동일 Vault 파일 접근 (iCloud Drive 등)

**예상 기간**: 2-3주

---

### Phase 2: 동기화 & AI
**목표**: 멀티 디바이스 + AI 기반 생산성 향상

**동기화**
- [ ] Nest.js 백엔드 구축 (클린 아키텍처)
- [ ] 사용자 인증 (이메일 또는 OAuth)
- [ ] CRDT 기반 또는 Last-Write-Wins 동기화
- [ ] 충돌 해결 UI

**AI 기능**
- [ ] 아침 의식: 오늘 할 일 브리핑
  - Inbox 미정리 항목
  - 오늘 마감 태스크
  - 각 프로젝트 Backlog 리뷰 제안
- [ ] 저녁 의식: 하루 리뷰
  - 완료 항목 확인
  - 미완료 항목 처리 (내일로 이동 등)
  - 하루 요약 생성
- [ ] AI 코칭: 격려, 조언

**예상 기간**: 6-8주

---

### Phase 3: 목표 관리
**목표**: 장기 목표와 일상 태스크의 연결

- [ ] 목표(Goal) 엔티티 추가
- [ ] 기간 설정 (주간/월간/분기/연간)
- [ ] 목표 ↔ 프로젝트 ↔ 태스크 연결
- [ ] 진척도 시각화 (프로그레스 바, 차트)
- [ ] AI 기반 목표 달성 조언

**예상 기간**: 4-6주

---

### Phase 4: 지식 관리 확장
**목표**: Obsidian 수준의 지식 관리

- [ ] 태스크 내 복수 페이지
- [ ] 독립 노트 (태스크와 무관한 문서)
- [ ] 태스크/노트 간 링크
- [ ] 백링크 패널
- [ ] 그래프 뷰
- [ ] 칸반 컬럼 커스터마이징
- [ ] 태그 시스템

**예상 기간**: 6-8주

---

## 7. MVP 제외 항목 (명시적)

아래 기능은 MVP에서 **의도적으로 제외**:

| 기능 | 제외 이유 | 대응 Phase |
|------|-----------|------------|
| AI 기능 전체 | 백엔드 필요, 복잡도 높음 | Phase 2 |
| 멀티 디바이스 동기화 | 백엔드 필요 | Phase 2 |
| 모바일 앱 | 데스크톱 우선 | Phase 1.5 |
| 목표 설정 | 핵심 루프 완성 후 | Phase 3 |
| 칸반 컬럼 커스터마이징 | 단순함 유지 | Phase 4 |
| 태스크 간 링크/백링크 | 복잡도 | Phase 4 |
| 팀 협업 | 개인용 앱 | 미정 |
| Windows/Linux | macOS 우선 | Phase 2+ |
| 다크모드 | 있으면 좋지만 MVP 필수 아님 | Phase 1 후반 |

---

## 8. 성공 기준

### 8.1 MVP 완료 기준
- [ ] Vault 폴더를 선택하고 데이터 저장/불러오기 정상 동작
- [ ] Inbox에 태스크 추가 가능
- [ ] 프로젝트 생성 및 태스크 할당 가능
- [ ] 칸반 보드에서 드래그앤드롭으로 상태 변경 가능
- [ ] 태스크에 마크다운 노트 작성 및 저장 가능
- [ ] 마감일 설정 시 알림 수신 가능
- [ ] 앱 재시작 후 데이터 유지

### 8.2 개인 사용 기준 (정성적)
- 일주일간 Todoist + Obsidian 대신 Taskdown만 사용 가능
- 데이터 유실 없음
- 일상적인 GTD 워크플로우 수행 가능

---

## 9. 리스크 & 미결정 사항

### 9.1 기술 리스크

| 리스크 | 영향 | 대응 |
|--------|------|------|
| Tauri + SQLite 통합 이슈 | 높음 | 초기에 PoC로 검증 |
| TipTap 이미지 삽입 복잡도 | 중간 | 로컬 파일 복사 방식으로 단순화 |
| Tauri 2.0 안정성 | 중간 | 커뮤니티 이슈 모니터링 |

### 9.2 미결정 사항

| 항목 | 선택지 | 결정 시점 |
|------|--------|-----------|
| TipTap 콘텐츠 저장 포맷 | JSON vs Markdown 텍스트 | 개발 초기 |
| UUID 생성 방식 | nanoid vs uuid | 개발 초기 |
| 다크모드 지원 | MVP 포함 vs 제외 | Phase 1 중반 |

---

## 10. 참고 자료

### 10.1 영감을 준 앱
- [Todoist](https://todoist.com) — GTD 기반 할 일 관리
- [Obsidian](https://obsidian.md) — 로컬 우선 마크다운 노트
- [Notion](https://notion.so) — 블록 기반 문서 + 데이터베이스
- [Linear](https://linear.app) — 미니멀 이슈 트래커 UX

### 10.2 기술 문서
- [Tauri 2.0 Docs](https://v2.tauri.app)
- [TipTap Docs](https://tiptap.dev)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [dnd-kit Docs](https://dndkit.com)

---

## Appendix A: 용어 정의

| 용어 | 정의 |
|------|------|
| Vault | 사용자가 선택한 데이터 저장 폴더 |
| Inbox | 프로젝트 미지정 태스크 모음 |
| GTD | Getting Things Done, David Allen의 생산성 방법론 |
| Refinement | Backlog 태스크를 구체화하여 Next로 이동시키는 과정 |
