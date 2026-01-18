# Proposal: add-taskdown-mvp

## Summary

GTD 기반 할 일 관리와 마크다운 노트를 결합한 로컬 우선 데스크톱 앱 **Taskdown**의 MVP를 구현한다.

## Motivation

### 문제

| 기존 도구 | 문제점 |
|-----------|--------|
| Todoist | 태스크에 충분한 맥락/문서를 담기 어려움 |
| Obsidian | 푸시 알림 없음, 할 일 관리 UX 불편, 플러그인 파편화 |
| 두 앱 병행 | 컨텍스트 스위칭 비용, 데이터 분산 |

### 해결책

- 각 태스크에 풍부한 마크다운 노트 연결
- 네이티브 알림 + 칸반 기반 태스크 관리
- 하나의 앱에서 통합 관리
- 로컬 우선으로 데이터 소유권 보장

## Scope

### Phase 1 포함 (이 Proposal)

| Capability | 설명 |
|------------|------|
| vault-storage | Vault 폴더 선택, SQLite 저장, 설정 관리 |
| task-management | 태스크/프로젝트 CRUD, Inbox |
| kanban-board | 4컬럼 칸반 보드, 드래그앤드롭 |
| markdown-editor | TipTap 기반 WYSIWYG 에디터 |
| notifications | 마감일 알림 (OS 네이티브) |

### Phase 1 제외

- AI 기능 (아침/저녁 의식, 코칭)
- 멀티 디바이스 동기화
- 모바일 앱
- 태스크 간 링크/백링크
- 팀 협업

## Technical Approach

### 기술 스택

> 상세 결정 근거: [ADRs](../../adrs/README.md)

- **Desktop**: Tauri 2.x (macOS 우선)
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **State**: Zustand + React Query
- **Database**: SQLite + Drizzle ORM (Proxy 패턴)
- **Editor**: TipTap
- **DnD**: dnd-kit

### 아키텍처

```
┌─────────────────────────────────────────────┐
│              Tauri 2.x Shell                │
├─────────────────────────────────────────────┤
│  React Frontend (WebView)                   │
│  ┌───────────────────────────────────────┐  │
│  │  Presentation: React + TipTap + dnd   │  │
│  ├───────────────────────────────────────┤  │
│  │  State: Zustand + React Query         │  │
│  ├───────────────────────────────────────┤  │
│  │  Data: Drizzle ORM (proxy mode)       │  │
│  └───────────────────────────────────────┘  │
│                    │ IPC                    │
│  ┌─────────────────▼─────────────────────┐  │
│  │  Tauri Backend (Rust)                 │  │
│  │  - SQLite (tauri-plugin-sql)          │  │
│  │  - Notifications                      │  │
│  │  - File dialogs                       │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## Success Criteria

- [ ] Vault 폴더 선택 후 데이터 저장/불러오기 정상 동작
- [ ] Inbox에 태스크 추가 가능
- [ ] 프로젝트 생성 및 태스크 할당 가능
- [ ] 칸반 보드에서 드래그앤드롭으로 상태 변경 가능
- [ ] 태스크에 마크다운 노트 작성 및 저장 가능
- [ ] 마감일 설정 시 알림 수신 가능
- [ ] 앱 재시작 후 데이터 유지

## Risks

| 리스크 | 영향 | 대응 |
|--------|------|------|
| Tauri + Drizzle 통합 복잡도 | 높음 | 검증된 Proxy 패턴 사용, 초기 PoC |
| TipTap 이미지 삽입 | 중간 | 로컬 파일 복사 방식으로 단순화 |
| macOS WebView 차이 | 중간 | Safari 기준 CSS 테스트 |

## Related

- [initial-spec.md](../../../initial-spec.md): 원본 기획서
- [ADRs](../../adrs/README.md): 기술 선택 근거
