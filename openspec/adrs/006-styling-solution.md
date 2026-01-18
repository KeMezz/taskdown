# ADR-006: 스타일링 솔루션

## Status
**Accepted**

## Context

Taskdown UI를 구축하기 위한 CSS 솔루션이 필요하다.

### 요구사항
- 빠른 개발 속도
- 일관된 디자인 시스템
- 작은 번들 크기
- 다크모드 지원 (Phase 1 후반)
- Tauri WebView (Safari) 호환

### 검토한 대안들

| 솔루션 | 런타임 | 번들 최적화 | 학습 곡선 | 다크모드 |
|--------|--------|------------|----------|---------|
| **Tailwind CSS 4** | 빌드타임 | ✅ PurgeCSS | 중간 | ✅ 내장 |
| CSS Modules | 빌드타임 | ✅ | 낮음 | ⚠️ 수동 |
| styled-components | 런타임 | ⚠️ | 중간 | ⚠️ 수동 |
| Vanilla Extract | 빌드타임 | ✅ | 높음 | ⚠️ 수동 |
| Panda CSS | 빌드타임 | ✅ | 중간 | ✅ 내장 |

## Decision

**Tailwind CSS 4를 스타일링 솔루션으로 사용한다.**

```json
{
  "devDependencies": {
    "tailwindcss": "^4.1.0",
    "@tailwindcss/vite": "^4.1.0"
  }
}
```

## Rationale

### Tailwind CSS 4 선택 이유

1. **성능 혁신**: Oxide 엔진으로 빌드 5배, 증분 빌드 100배 이상 빠름
2. **설정 간소화**: 제로 설정, CSS 파일 한 줄로 시작
3. **Vite 통합**: 공식 Vite 플러그인으로 최적의 DX
4. **자동 컨텐츠 감지**: 수동 `content` 설정 불필요
5. **모던 CSS**: Cascade Layers, `@property`, `color-mix()` 활용
6. **컨테이너 쿼리**: 내장 지원 (`@sm:`, `@lg:`)

### Tailwind CSS 4 주요 변경사항

```css
/* v4 설정 - CSS 파일에서 직접 */
@import "tailwindcss";

@theme {
  --color-primary: #6366f1;
  --font-sans: "Inter", sans-serif;
}
```

### 다크모드 전략

```css
/* 시스템 설정 따르기 (기본) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #1a1a1a;
  }
}

/* 또는 클래스 기반 */
.dark {
  --color-background: #1a1a1a;
}
```

```tsx
// 사용 예시
<div className="bg-white dark:bg-gray-900">
  <h1 className="text-gray-900 dark:text-white">
    Taskdown
  </h1>
</div>
```

### 디자인 토큰 구조

```css
@theme {
  /* Colors */
  --color-primary: #6366f1;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;

  /* Kanban Column Colors */
  --color-backlog: #94a3b8;
  --color-next: #3b82f6;
  --color-waiting: #f59e0b;
  --color-done: #22c55e;

  /* Spacing */
  --spacing-sidebar: 240px;
  --spacing-card-gap: 8px;

  /* Typography */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}
```

## Consequences

### Positive
- 빠른 개발 속도 (유틸리티 클래스)
- 일관된 디자인 시스템 강제
- 최소한의 CSS 번들 (사용된 클래스만)
- 다크모드 내장 지원
- 활발한 생태계와 커뮤니티

### Negative
- HTML에 클래스가 많아질 수 있음
- 복잡한 애니메이션은 별도 CSS 필요
- 유틸리티 클래스 학습 필요

### Safari (Tauri WebView) 호환성

Tailwind CSS 4는 모던 CSS 기능을 사용하지만, 대부분 Safari 16.4+ (macOS Ventura+)에서 지원:
- Cascade Layers: ✅
- `@property`: ✅
- `color-mix()`: ✅
- Container Queries: ✅

## References

- [Tailwind CSS v4.0 Announcement](https://tailwindcss.com/blog/tailwindcss-v4)
- [Tailwind CSS Releases](https://github.com/tailwindlabs/tailwindcss/releases)
- [Tailwind CSS v4 Deep Dive](https://www.dataformathub.com/blog/tailwind-css-v4-deep-dive-why-the-oxide-engine-changes-everything-in-2025-lz4)
