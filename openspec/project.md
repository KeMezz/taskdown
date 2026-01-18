# Project Context

## Purpose

**Taskdown** — GTD 기반 할 일 관리와 마크다운 노트를 결합한 로컬 우선 생산성 앱

### 핵심 가치
- **로컬 우선**: 데이터는 사용자 소유, Git으로 버전 관리 가능
- **단순함**: 플러그인 없이 핵심 기능만 잘 동작
- **GTD 철학**: Inbox → 프로젝트 → 실행의 자연스러운 흐름

### 해결하는 문제
| 기존 도구 | 문제점 | Taskdown의 해결 |
|-----------|--------|-----------------|
| Todoist | 태스크에 충분한 맥락/문서를 담기 어려움 | 각 태스크에 풍부한 마크다운 노트 |
| Obsidian | 푸시 알림 없음, 할 일 관리 UX 불편 | 네이티브 알림 + 칸반 기반 태스크 관리 |
| 두 앱 병행 | 컨텍스트 스위칭 비용, 데이터 분산 | 하나의 앱에서 통합 관리 |

## Tech Stack

> 기술 선택 근거는 [ADRs](./adrs/README.md) 참조

### Core
- **Desktop Shell**: Tauri 2.x ([ADR-002](./adrs/002-tauri-desktop-framework.md))
- **Frontend**: React 19 + TypeScript ([ADR-001](./adrs/001-react-version.md))
- **Build**: Vite 5
- **Styling**: Tailwind CSS 4 ([ADR-006](./adrs/006-styling-solution.md))

### State & Data
- **상태관리**: Zustand
- **서버 상태**: @tanstack/react-query
- **ORM**: Drizzle ORM (Proxy 패턴) ([ADR-004](./adrs/004-database-strategy.md))
- **DB**: SQLite (Tauri SQL plugin 또는 sqlx)

### UI Components
- **마크다운 에디터**: TipTap ([ADR-003](./adrs/003-markdown-editor.md))
- **드래그앤드롭**: dnd-kit ([ADR-005](./adrs/005-drag-and-drop.md))
- **알림**: Tauri Notification Plugin

## Project Conventions

### Code Style
- **언어**: TypeScript strict mode
- **포맷팅**: Prettier (기본 설정)
- **린팅**: ESLint with recommended rules
- **네이밍**:
  - 컴포넌트: PascalCase (`TaskCard.tsx`)
  - 훅: camelCase with `use` prefix (`useTaskList.ts`)
  - 유틸리티: camelCase (`formatDate.ts`)
  - 상수: SCREAMING_SNAKE_CASE
- **파일 구조**: feature-based 구조 선호

### Architecture Patterns

> [ADR-007: 모노레포 구조](./adrs/007-monorepo-structure.md)

**모노레포 구조** (pnpm workspaces):
```
taskdown/
├── apps/
│   └── desktop/              # @taskdown/desktop (Tauri 앱)
│       ├── src-tauri/        # Rust 백엔드
│       └── src/
│           ├── features/     # 앱 전용 기능
│           └── stores/       # Zustand 스토어
├── packages/
│   ├── ui/                   # @taskdown/ui (공유 컴포넌트)
│   │   └── src/
│   │       ├── components/
│   │       └── hooks/
│   └── db/                   # @taskdown/db (데이터베이스)
│       └── src/
│           ├── schema.ts
│           └── types.ts
└── tooling/                  # 공유 설정
```

**레이어 구조**:
1. **Presentation Layer**: React + TipTap + dnd-kit + Zustand
2. **Repository Layer**: Interface 기반 (향후 교체 용이)
3. **Data Layer**: Drizzle ORM + SQLite (packages/db)

### Testing Strategy
- **Unit Tests**: Vitest
- **Component Tests**: React Testing Library
- **E2E Tests**: Phase 2에서 Playwright 도입 예정
- **Coverage Target**: MVP에서는 핵심 비즈니스 로직 위주

### Git Workflow
- **Branch Strategy**: GitHub Flow (main + feature branches)
- **Branch Naming**: `feature/`, `fix/`, `refactor/` prefix
- **Commit Convention**: Conventional Commits
  - `feat:` 새로운 기능
  - `fix:` 버그 수정
  - `refactor:` 리팩토링
  - `docs:` 문서 변경
  - `chore:` 기타 변경

## Domain Context

### GTD (Getting Things Done) 용어
| 용어 | 정의 |
|------|------|
| **Inbox** | 모든 할 일의 진입점, 프로젝트 미지정 태스크 모음 |
| **Project** | 여러 태스크를 포함하는 논리적 그룹 |
| **Refinement** | Backlog 태스크를 구체화하여 Next로 이동시키는 과정 |

### 칸반 컬럼 (고정 4컬럼)
| Status | 컬럼명 | 설명 |
|--------|--------|------|
| `backlog` | Backlog | 언젠가 할 일, 미정리 |
| `next` | Next | 다음에 할 일, 액션 가능 |
| `waiting` | Waiting | 대기 중 (다른 사람/조건) |
| `done` | Done | 완료 |

### Vault 구조
```
[User Selected Vault]/
├── .taskdown/
│   ├── data.db          # SQLite 데이터베이스
│   ├── config.json      # 앱 설정
│   └── assets/          # 이미지, 첨부파일
│       └── {uuid}.{ext}
└── .gitignore           # 자동 생성 (선택적)
```

## Important Constraints

### MVP 범위 제한
- **Phase 1 포함**: 태스크/프로젝트 CRUD, 칸반, 마크다운 에디터, 알림
- **Phase 1 제외**: AI 기능, 동기화, 모바일, 백링크, 협업

### 기술적 제약
- **macOS 우선**: Windows/Linux는 Phase 2+
- **로컬 전용**: 클라우드 동기화 없음 (MVP)
- **단일 사용자**: 협업 기능 없음

### 성능 목표
- 앱 시작 시간: < 2초
- 태스크 저장: 실시간 (디바운스 적용)
- 칸반 드래그: 60fps 유지

## External Dependencies

### Tauri Plugins
- `@tauri-apps/plugin-sql`: SQLite 접근
- `@tauri-apps/plugin-notification`: OS 네이티브 알림
- `@tauri-apps/plugin-dialog`: 파일/폴더 다이얼로그

### TipTap Extensions
- `@tiptap/starter-kit`: 기본 에디터 기능
- `@tiptap/extension-task-list`: 체크리스트
- `@tiptap/extension-image`: 이미지 삽입
- `@tiptap/extension-code-block-lowlight`: 코드 하이라이팅

## References

### 영감을 준 앱
- [Todoist](https://todoist.com) — GTD 기반 할 일 관리
- [Obsidian](https://obsidian.md) — 로컬 우선 마크다운 노트
- [Linear](https://linear.app) — 미니멀 이슈 트래커 UX

### 기술 문서
- [Tauri 2.0 Docs](https://v2.tauri.app)
- [TipTap Docs](https://tiptap.dev)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [dnd-kit Docs](https://dndkit.com)
