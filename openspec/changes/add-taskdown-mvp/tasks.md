# Tasks: add-taskdown-mvp

구현 순서대로 정렬된 작업 목록입니다. 체크박스로 진행 상황을 추적합니다.

## Phase 0: 프로젝트 초기화

### 0.1 모노레포 셋업
- [x] 루트 package.json 생성 (`"private": true`)
- [x] pnpm-workspace.yaml 생성
- [x] 디렉토리 구조 생성 (apps/, packages/, tooling/)
- [x] 루트 스크립트 설정 (dev, build, lint, typecheck)

### 0.2 @taskdown/desktop 패키지 (apps/desktop)
- [x] Tauri 2.x + React 19 + TypeScript 프로젝트 생성
- [x] Vite 설정 및 개발 환경 구성
- [x] Tailwind CSS 4 설치 및 설정
- [x] apps/desktop/src/ 폴더 구조 (features/, stores/)

### 0.3 @taskdown/ui 패키지 (packages/ui)
- [x] package.json 생성 (`@taskdown/ui`)
- [x] TypeScript 설정
- [x] Tailwind CSS 설정 (preset으로 공유)
- [x] src/components/, src/hooks/ 구조 생성
- [x] 빌드 설정 (tsup 또는 unbuild)

### 0.4 @taskdown/db 패키지 (packages/db)
- [x] package.json 생성 (`@taskdown/db`)
- [x] TypeScript 설정
- [x] Drizzle ORM + drizzle-kit 설치
- [x] src/schema.ts, src/types.ts 구조 생성

### 0.5 공유 설정 (tooling/)
- [x] ESLint 공유 설정 (tooling/eslint/)
- [x] TypeScript 공유 설정 (tooling/typescript/)
- [x] Prettier 설정 (루트)

### 0.6 Tauri 플러그인 및 Drizzle Proxy PoC
- [x] tauri-plugin-sql 설치 및 권한 설정
- [x] tauri-plugin-notification 설치 및 권한 설정
- [x] tauri-plugin-dialog 설치 및 권한 설정
- [x] Drizzle Proxy PoC 검증
  - [x] Rust 측 `run_sql` command 기본 구현
  - [x] TypeScript 측 drizzle proxy 연결 테스트
  - [x] 3가지 메서드 (run/get/all) 동작 확인
  - [x] 기본 타입 변환 검증 (NULL, String, Number, Boolean)

### 0.7 앱 의존성 설치 (apps/desktop)
- [x] @taskdown/ui, @taskdown/db workspace 의존성 연결
- [x] Zustand 설치
- [x] React Query 설치
- [x] TipTap 에디터 패키지 설치
- [x] dnd-kit 설치
- [x] nanoid 설치

**검증**: `pnpm dev`로 앱 실행, Tauri 윈도우 열림 확인

### 0.8 테스트 인프라 구축
- [x] Vitest 워크스페이스 설정 (vitest.workspace.ts)
- [x] 루트 테스트 스크립트 추가 (test, test:run, test:coverage)
- [x] @taskdown/db: better-sqlite3 in-memory DB 헬퍼
- [x] @taskdown/ui: jsdom 환경 설정
- [x] @taskdown/desktop: Tauri API 모킹, Zustand 테스트 헬퍼
- [x] CI/CD 워크플로우 (.github/workflows/test.yml)

**검증**: `pnpm test:run` 통과, CI 파이프라인 동작 확인

---

## Phase 1: 데이터 레이어 (vault-storage)

### 1.1 Drizzle 스키마 정의 (packages/db)
- [x] projects 테이블 스키마 작성
- [x] tasks 테이블 스키마 작성
- [x] reminders 테이블 스키마 작성
- [x] 관계(relations) 정의
- [x] 타입 내보내기 (Task, Project, Reminder)

### 1.2 Drizzle Proxy 구현
- [x] Rust 측 `run_sql` command 구현
- [x] TypeScript 측 drizzle proxy 설정
- [x] 기본 CRUD 동작 테스트

### 1.3 마이그레이션 시스템
- [x] drizzle-kit으로 마이그레이션 SQL 생성
- [x] 앱 시작 시 마이그레이션 실행 로직 구현
- [x] 버전 테이블로 마이그레이션 상태 관리

### 1.4 Vault 관리
- [x] .taskdown/ 폴더 구조 초기화 로직
- [x] config.json 읽기/쓰기
- [x] 앱 시작 시 Vault 자동 초기화 (고정 경로: $APPDATA)

**검증**: 앱 시작 → $APPDATA/.taskdown/ 자동 생성 → 데이터 유지 확인

---

## Phase 2: 기본 UI 레이아웃

### 2.1 앱 셸 구조
- [x] 메인 레이아웃 컴포넌트 (Sidebar + Main)
- [x] Sidebar 컴포넌트 (Inbox, Projects, Settings)
- [x] Toolbar 컴포넌트 (검색, 새 태스크 버튼)
- [x] 반응형 레이아웃 (사이드바 접기)

### 2.2 상태 관리 셋업
- [x] appStore (vaultPath, isInitialized)
- [x] sidebarStore (selectedProjectId)
- [x] taskStore (selectedTaskId)
- [x] React Query provider 설정

### 2.3 라우팅 및 뷰 전환
- [x] Inbox 뷰 라우트
- [x] Project 뷰 라우트
- [x] Settings 뷰 라우트
- [x] 뷰 전환 애니메이션

**검증**: 사이드바에서 Inbox/프로젝트/설정 전환 동작 확인

---

## Phase 3: 태스크/프로젝트 CRUD (task-management)

### 3.1 프로젝트 CRUD
- [x] useProjects 훅 (목록 조회)
- [x] useCreateProject 훅
- [x] useUpdateProject 훅
- [x] useDeleteProject 훅
- [x] 사이드바 프로젝트 목록 UI
- [x] 프로젝트 생성 다이얼로그
- [ ] 프로젝트 컨텍스트 메뉴 (이름 변경, 삭제)

### 3.2 태스크 CRUD
- [x] useTasks 훅 (프로젝트별/Inbox 조회)
- [x] useCreateTask 훅
- [x] useUpdateTask 훅
- [x] useDeleteTask 훅
- [x] 태스크 카드 컴포넌트

### 3.3 빠른 태스크 생성
- [x] 인라인 태스크 생성 입력 필드
- [x] ⌘ + N 단축키 핸들링
- [x] 프로젝트 컨텍스트 인식

**검증**: 프로젝트 생성 → 태스크 추가 → 수정 → 삭제 전체 플로우

---

## Phase 4: 칸반 보드 (kanban-board)

### 4.1 칸반 레이아웃
- [ ] KanbanBoard 컴포넌트
- [ ] KanbanColumn 컴포넌트 (헤더, 카운트)
- [ ] 4컬럼 고정 레이아웃
- [ ] 빈 컬럼 상태 표시

### 4.2 드래그앤드롭
- [ ] dnd-kit DndContext 설정
- [ ] SortableContext 컬럼별 설정
- [ ] 컬럼 간 이동 핸들러
- [ ] 컬럼 내 순서 변경 핸들러
- [ ] DragOverlay 구현

### 4.3 sort_order 관리
- [ ] 드롭 위치 기반 sort_order 계산
- [ ] 배치 업데이트 로직
- [ ] 낙관적 업데이트 (React Query)

**검증**: 태스크 드래그 → 컬럼 이동 → 순서 변경 → 새로고침 후 유지 확인

---

## Phase 5: 태스크 상세 패널

### 5.1 슬라이드 패널
- [ ] TaskDetailPanel 컴포넌트
- [ ] 슬라이드 인/아웃 애니메이션
- [ ] Esc로 닫기
- [ ] 클릭 아웃사이드로 닫기

### 5.2 태스크 메타데이터 편집
- [ ] 제목 인라인 편집
- [ ] 프로젝트 드롭다운
- [ ] 마감일 데이트피커
- [ ] 생성일/수정일 표시

**검증**: 태스크 클릭 → 패널 열림 → 수정 → 저장 확인

---

## Phase 6: 마크다운 에디터 (markdown-editor)

### 6.1 TipTap 에디터 셋업
- [ ] useTaskEditor 훅 구현
- [ ] StarterKit 설정
- [ ] 에디터 스타일링 (prose)

### 6.2 체크리스트 지원
- [ ] TaskList, TaskItem 익스텐션 추가
- [ ] 체크박스 토글 스타일링

### 6.3 코드 블록
- [ ] CodeBlockLowlight 익스텐션 추가
- [ ] lowlight 언어 설정
- [ ] 코드 블록 스타일링

### 6.4 이미지 삽입
- [ ] Image 익스텐션 추가
- [ ] 이미지 업로드 핸들러 (Rust 연동)
- [ ] 드래그앤드롭 이미지 삽입
- [ ] 클립보드 이미지 붙여넣기

### 6.5 자동 저장
- [ ] 디바운스 저장 로직 (500ms)
- [ ] 저장 상태 인디케이터

**검증**: 에디터에서 마크다운 작성 → 체크리스트/코드/이미지 → 저장 → 새로고침 확인

---

## Phase 7: 알림 시스템 (notifications)

### 7.1 알림 권한
- [ ] 권한 상태 확인 로직
- [ ] 권한 요청 UI
- [ ] 설정에서 권한 상태 표시

### 7.2 리마인더 CRUD
- [ ] 마감일 설정 시 알림 자동 생성
- [ ] 마감일 변경/삭제 시 알림 업데이트
- [ ] 기본 알림 시간 설정

### 7.3 알림 스케줄러
- [ ] 1분 간격 알림 체크 로직
- [ ] 알림 발송 로직
- [ ] 앱 시작 시 누락 알림 처리
- [ ] 완료 태스크 알림 건너뛰기

**검증**: 마감일 설정 → 시간 대기 → 알림 수신 확인

---

## Phase 8: 마무리 및 폴리싱

### 8.1 키보드 단축키
- [ ] ⌘ + N: 새 태스크
- [ ] ⌘ + ⇧ + N: 새 프로젝트
- [ ] ⌘ + ,: 설정
- [ ] ⌘ + F: 검색 (포커스)
- [ ] Esc: 패널/모달 닫기

### 8.2 설정 화면
- [ ] Vault 경로 표시 (읽기 전용)
- [ ] 기본 알림 시간 설정
- [ ] 테마 설정 (light/dark/system) - 선택적

### 8.3 에러 처리 및 UX
- [ ] 전역 에러 바운더리
- [ ] 토스트 알림 시스템
- [ ] 로딩 상태 표시
- [ ] 빈 상태 표시

### 8.4 성능 최적화
- [ ] React Query 캐싱 최적화
- [ ] 컴포넌트 메모이제이션
- [ ] 가상화 검토 (태스크 많을 경우)

**검증**: MVP 성공 기준 전체 체크

---

## 병렬화 가능 작업

다음 작업들은 의존성이 없어 병렬로 진행 가능:

- Phase 0.3과 Phase 1.1 (의존성 설치 & 스키마 정의)
- Phase 2와 Phase 1.2-1.4 (UI 레이아웃 & DB 연동)
- Phase 6과 Phase 7 (에디터 & 알림 - 각각 독립적)

## 예상 의존성 그래프

```
Phase 0 → Phase 1 → Phase 2+3 → Phase 4+5
                         ↓
                    ┌────┴────┐
                 Phase 6   Phase 7
                    └────┬────┘
                         ↓
                     Phase 8
```

> **참고**: Phase 6(에디터)와 Phase 7(알림)은 Phase 2+3 완료 후 병렬 진행 가능
