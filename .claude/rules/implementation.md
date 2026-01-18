# Implementation Rules

구현 명령 시 적용되는 규칙입니다.

## Phase별 PR 분할 전략

`openspec:apply` 또는 구현 요청 시, `tasks.md`의 Phase 구조를 기반으로 PR을 분리합니다.

### PR 분할 기준

| PR | Phase | Capability | 의존성 |
|----|-------|------------|--------|
| #1 | Phase 0 | 프로젝트 초기화 | 없음 |
| #2 | Phase 1 | vault-storage | #1 |
| #3 | Phase 2 + 3 | UI + task-management | #2 |
| #4 | Phase 4 + 5 | kanban-board + 상세패널 | #3 |
| #5 | Phase 6 | markdown-editor | #3 (병렬 가능) |
| #6 | Phase 7 | notifications | #3 (병렬 가능) |
| #7 | Phase 8 | 폴리싱 + archive | 전체 |

### 브랜치 네이밍 규칙

```
feat/phase-0-init
feat/phase-1-vault
feat/phase-2-3-ui-crud
feat/phase-4-5-kanban
feat/phase-6-editor
feat/phase-7-notify
feat/phase-8-polish
```

### Phase 2+3 병합 이유

Phase 2(UI 레이아웃)와 Phase 3(태스크 CRUD)를 하나의 PR로 병합하는 이유:

1. **단독 검증 불가**: Phase 2의 라우팅만으로는 의미 있는 기능 검증이 불가능
2. **데이터 의존성**: 프로젝트/태스크 목록 표시에 Phase 3의 CRUD 훅 필수
3. **적정 PR 규모**: 두 Phase 합쳐도 ~500 LoC 예상으로 리뷰 가능한 범위
4. **테스트 효율**: 통합 테스트로 전체 데이터 흐름 한 번에 검증 가능

### Phase 4+5 병합 이유

Phase 4(칸반 보드)와 Phase 5(상세 패널)를 하나의 PR로 병합하는 이유:

1. **UX 완결성**: 태스크 클릭 → 상세 패널 열기는 하나의 사용자 플로우
2. **코드 의존성**: 상세 패널이 칸반 보드의 선택 상태(selectedTaskId)에 의존
3. **적정 PR 규모**: 두 Phase 합쳐도 ~600 LoC 예상으로 리뷰 가능한 범위
4. **테스트 효율**: 태스크 선택 → 편집 → 저장 전체 플로우를 한 번에 검증 가능

## 서브에이전트 병렬 처리

### 병렬화 가능한 작업

다음 작업들은 의존성이 없어 **Task tool로 동시에 실행**해야 합니다:

1. **Phase 0 내부**:
   - 0.3 @taskdown/ui 패키지 ↔ 0.4 @taskdown/db 패키지

2. **Phase 1-2**:
   - Phase 2 UI 레이아웃 ↔ Phase 1.2-1.4 DB 연동

3. **Phase 6-7** (별도 PR 병렬):
   - Phase 6 마크다운 에디터 ↔ Phase 7 알림 시스템

### 병렬 실행 패턴

```yaml
# 단일 메시지에서 여러 Task tool 호출
Task 1: "packages/ui 패키지 초기화" (subagent_type: general-purpose)
Task 2: "packages/db 패키지 초기화" (subagent_type: general-purpose)
```

**IMPORTANT**: 병렬 가능한 작업은 반드시 **한 번의 응답에서 여러 Task tool을 동시에 호출**해야 합니다.

## 구현 워크플로우

### 1. Phase 시작 전

```bash
# 1. 관련 문서 확인
Read: openspec/changes/add-taskdown-mvp/tasks.md
Read: openspec/changes/add-taskdown-mvp/specs/{capability}/spec.md

# 2. 브랜치 생성
git checkout -b feat/phase-N-name
```

### 2. 구현 중

- **TodoWrite**로 진행 상황 추적
- 병렬화 가능한 작업은 **Task tool로 동시 실행**
- 각 태스크 완료 시 `tasks.md` 체크박스 업데이트 (`- [x]`)

### 3. Phase 완료 후

```bash
# 검증
openspec validate add-taskdown-mvp --strict

# 커밋 및 PR
git add .
git commit -m "feat(phase-N): ..."
git push -u origin feat/phase-N-name
gh pr create
```

### 4. 전체 완료 후

```bash
openspec archive add-taskdown-mvp --yes
```

## tasks.md 체크박스 동기화 프로세스

### 업데이트 주체

- **구현 중**: Claude가 각 태스크 완료 시 실시간으로 `- [x]` 체크

### 업데이트 타이밍

1. 개별 태스크 완료 직후 (구현 중)
2. PR 생성 시 완료된 태스크 확인
3. PR 머지 후 main 브랜치에서 최종 확인

### 충돌 방지

- 각 Phase 브랜치에서 해당 Phase의 태스크만 업데이트
- 다른 Phase의 체크박스는 수정하지 않음

## 주의사항

- **의존성 그래프 준수**: PR 머지 순서는 반드시 의존성을 따름
- **Spec 일관성**: 구현이 spec의 Scenario와 일치하는지 검증
- **tasks.md 동기화**: PR 완료 시 체크박스 반드시 업데이트
- **단일 archive**: 모든 Phase 완료 후 마지막에 한 번만 archive
