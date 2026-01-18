# ADR-001: React 버전 선택

## Status
**Accepted**

## Context

initial-spec.md에서는 React 18을 명시했으나, 현재 React 생태계의 최신 상황을 검토할 필요가 있다.

### 현재 상황 (2026년 1월 기준)
- React 19.2.3이 최신 안정 버전 (2025년 12월)
- React 19는 2024년 12월에 안정 버전 출시
- React 18은 여전히 지원되지만 새 프로젝트에서는 권장하지 않음

### React 19 주요 변경사항
- **React Compiler**: 자동 메모이제이션으로 `useMemo`, `useCallback` 수동 최적화 감소
- **Actions API**: 폼 처리 및 서버 액션 개선
- **`<Activity>`**: UI 숨기기/복원 (19.2+)
- **`useEffectEvent`**: Effect에서 비반응형 로직 추출 (19.2+)

## Decision

**React 19 (최신 안정 버전)를 사용한다.**

```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  }
}
```

## Rationale

### React 19 선택 이유

1. **새 프로젝트**: 기존 마이그레이션 부담 없음
2. **장기 지원**: 최신 버전이 더 오래 지원됨
3. **성능 개선**: React Compiler로 자동 최적화
4. **생태계 호환성**: 주요 라이브러리 대부분 React 19 지원
   - TipTap: ✅ 지원
   - Zustand: ✅ 지원
   - React Query: ✅ 지원
   - dnd-kit: ✅ 지원

### 주의사항

1. **Tauri 호환성**: Tauri 2.x는 React 버전에 무관 (WebView 기반)
2. **일부 레거시 라이브러리**: React 19 미지원 가능성 → 사용 전 확인 필요

## Consequences

### Positive
- 최신 React 기능 활용 가능
- 더 나은 성능 (React Compiler)
- 장기적 유지보수성

### Negative
- 일부 튜토리얼/예제가 React 18 기준일 수 있음
- 새로운 API 학습 필요

## References

- [React 19.2 Release](https://react.dev/blog/2025/10/01/react-19-2)
- [React Versions](https://react.dev/versions)
- [React v19 Announcement](https://react.dev/blog/2024/12/05/react-19)
