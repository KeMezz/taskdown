# PR Workflow Rules

Phase별 PR 생성 및 리뷰 워크플로우입니다.

## PR 생성 규칙

### 커밋 메시지 형식

```
feat(phase-N): 간단한 설명

- 세부 변경 사항 1
- 세부 변경 사항 2

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### PR 제목 형식

```
feat(phase-N): Phase 이름 구현
```

예시:
- `feat(phase-0): 모노레포 프로젝트 초기화`
- `feat(phase-1): vault-storage 데이터 레이어 구현`
- `feat(phase-6): TipTap 마크다운 에디터 구현`

## PR 본문 템플릿

```markdown
## Summary

Phase N: [Phase 이름] 구현

### 완료된 태스크

- [x] N.1 태스크 설명
- [x] N.2 태스크 설명
- [x] N.3 태스크 설명

### 관련 Spec

- [capability-name](openspec/changes/add-taskdown-mvp/specs/capability-name/spec.md)

### 주요 변경 사항

- 변경 1
- 변경 2

## Test Plan

- [ ] `openspec validate add-taskdown-mvp --strict` 통과
- [ ] 로컬 빌드 성공 (`pnpm build`)
- [ ] 기능 동작 확인

## Dependencies

- Requires: #이전PR번호 (있는 경우)
- Blocks: #다음PR번호 (있는 경우)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## PR 생성 명령어

```bash
gh pr create \
  --title "feat(phase-N): Phase 이름 구현" \
  --body "$(cat <<'EOF'
## Summary
...PR 본문...
EOF
)"
```

## 리뷰 대기 안내

PR 생성 후 사용자에게 다음을 안내:

1. PR URL 제공
2. 주요 변경 사항 요약
3. 다음 단계 (리뷰 후 머지 → 다음 Phase 진행)

## 머지 후 작업

PR이 머지된 후:

1. `main` 브랜치로 전환
2. 최신 변경 사항 pull
3. `tasks.md` 체크박스 상태 확인
4. 다음 Phase 브랜치 생성
