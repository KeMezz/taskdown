# ADR-007: 모노레포 구조

## Status
**Accepted**

## Context

Taskdown은 Phase 1.5에서 모바일 앱(iOS)을 계획하고 있다. 데스크톱과 모바일 앱 간 코드 공유를 위해 프로젝트를 모노레포로 구성해야 한다.

### 요구사항
- 데스크톱/모바일 앱 간 UI 컴포넌트 공유
- 데이터베이스 스키마 및 로직 공유
- 독립적인 빌드 및 배포
- 개발 환경 단순성 유지

### 검토한 대안들

| 도구 | 빌드 캐싱 | 복잡도 | 학습 곡선 |
|------|----------|--------|----------|
| **pnpm workspaces** | ❌ | 낮음 | 낮음 |
| pnpm + turborepo | ✅ | 중간 | 중간 |
| Nx | ✅ | 높음 | 높음 |

## Decision

**pnpm workspaces만 사용하여 모노레포를 구성한다.**

### 패키지 구조

```
taskdown/
├── pnpm-workspace.yaml
├── package.json              # 루트 (scripts, devDependencies)
├── apps/
│   └── desktop/              # Tauri 데스크톱 앱
│       ├── package.json
│       ├── src-tauri/        # Rust 백엔드
│       └── src/              # React 프론트엔드 (앱 전용)
├── packages/
│   ├── ui/                   # 공유 UI 컴포넌트
│   │   ├── package.json
│   │   └── src/
│   │       ├── components/   # Button, Input, Card 등
│   │       ├── hooks/        # useDebounce, useLocalStorage 등
│   │       └── index.ts
│   └── db/                   # 데이터베이스 레이어
│       ├── package.json
│       └── src/
│           ├── schema.ts     # Drizzle 스키마
│           ├── types.ts      # 타입 정의
│           └── index.ts
└── tooling/                  # 선택적: 공유 설정
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

```json
// 루트 package.json
{
  "name": "taskdown",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter @taskdown/desktop dev",
    "build": "pnpm --filter @taskdown/desktop build",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  }
}
```

### 패키지 네이밍

- `@taskdown/desktop`: 데스크톱 앱
- `@taskdown/ui`: 공유 UI 컴포넌트
- `@taskdown/db`: 데이터베이스 레이어

## Rationale

### pnpm workspaces만 선택한 이유

1. **단순함**: 추가 도구 학습 없이 시작 가능
2. **충분한 기능**: 현재 규모에서 빌드 캐싱이 필수 아님
3. **점진적 확장**: 필요 시 turborepo 추가 가능
4. **Tauri 호환성**: pnpm과 Tauri의 검증된 조합

### 패키지 분리 기준

**@taskdown/ui**
- 플랫폼 독립적인 UI 컴포넌트
- Tailwind 스타일링 포함
- Phase 1.5 모바일 앱에서 재사용

**@taskdown/db**
- Drizzle 스키마 정의
- 타입 정의 (Task, Project, Reminder)
- 마이그레이션 로직
- 플랫폼별 드라이버는 앱에서 주입

### turborepo를 선택하지 않은 이유

- MVP 단계에서 빌드 캐싱 이점 미미
- 추가 설정 및 학습 비용
- 나중에 `turbo.json` 추가로 쉽게 도입 가능

## Consequences

### Positive
- 코드 공유로 중복 제거
- 독립적인 버전 관리 가능
- Phase 1.5 모바일 앱 준비
- 단순한 초기 설정

### Negative
- 패키지 간 의존성 관리 필요
- 초기 설정이 단일 앱보다 복잡
- TypeScript 프로젝트 레퍼런스 설정 필요

### 향후 확장

Phase 1.5에서 모바일 앱 추가 시:
```
apps/
├── desktop/     # 기존
└── mobile/      # 추가 (Tauri Mobile 또는 React Native)
```

빌드 성능 이슈 발생 시:
```bash
pnpm add -Dw turbo
# turbo.json 추가
```

## References

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Tauri + pnpm workspaces](https://github.com/tauri-apps/tauri/discussions/5450)
