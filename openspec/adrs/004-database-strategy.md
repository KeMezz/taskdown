# ADR-004: ORM 및 데이터베이스 전략

## Status
**Accepted**

## Context

로컬 우선 앱으로서 클라이언트 측 데이터베이스가 필요하다. Tauri 환경에서 타입 안전한 데이터베이스 접근이 요구된다.

### 요구사항
- 로컬 파일 기반 (Vault 폴더)
- 타입 안전성 (TypeScript)
- 마이그레이션 지원
- Tauri 2.0 호환

### 검토한 대안들

| 솔루션 | 타입 안전성 | Tauri 호환 | 마이그레이션 | 복잡도 |
|--------|-----------|------------|-------------|--------|
| **Drizzle + SQLite** | ✅ 높음 | ⚠️ Proxy 필요 | ✅ | 중간 |
| Prisma + SQLite | ✅ 높음 | ❌ 제한적 | ✅ | 높음 |
| tauri-plugin-sql (직접) | ❌ | ✅ | ❌ | 낮음 |
| sql.js | ✅ 중간 | ✅ | ❌ | 중간 |

## Decision

**Drizzle ORM + SQLite를 Drizzle Proxy 패턴으로 사용한다.**

### 아키텍처

```
┌─────────────────────────────────────────┐
│           React Frontend                │
│  ┌─────────────────────────────────┐    │
│  │      Drizzle ORM (proxy mode)   │    │
│  │      - 타입 안전한 쿼리 빌더    │    │
│  │      - SQL 생성                 │    │
│  └──────────────┬──────────────────┘    │
│                 │ SQL string + params   │
│  ┌──────────────▼──────────────────┐    │
│  │      Tauri Command (IPC)        │    │
│  └──────────────┬──────────────────┘    │
└─────────────────┼───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           Tauri Backend (Rust)          │
│  ┌─────────────────────────────────┐    │
│  │   tauri-plugin-sql (SQLite)     │    │
│  │   또는 sqlx (더 많은 기능)      │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### 의존성

```json
{
  "dependencies": {
    "drizzle-orm": "^0.33.0",
    "@tauri-apps/plugin-sql": "^2.0.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.24.0"
  }
}
```

## Rationale

### Drizzle ORM 선택 이유

1. **타입 안전성**: 스키마에서 타입 자동 추론
2. **가벼움**: ~45KB 번들 크기
3. **SQL 친화적**: SQL과 유사한 API로 학습 용이
4. **Proxy 모드**: Tauri 환경에 적합

### SQLite 선택 이유

1. **단일 파일**: Vault 폴더 내 `data.db` 하나로 관리
2. **Git 호환**: 바이너리지만 버전 관리 가능
3. **성능**: 로컬 데이터에 최적
4. **신뢰성**: 수십 년간 검증된 데이터베이스

### Drizzle Proxy 패턴

Tauri의 샌드박스 환경에서는 Node.js처럼 직접 파일시스템 접근이 불가능하다. Drizzle Proxy를 사용하면:

```typescript
// drizzle이 SQL 생성 → Tauri IPC로 실행 → 결과 반환
const db = drizzle(async (sql, params, method) => {
  const result = await invoke('run_sql', { sql, params, method });
  return result;
});
```

### 마이그레이션 전략

1. `drizzle-kit`으로 마이그레이션 SQL 생성
2. 앱 시작 시 Tauri 백엔드에서 마이그레이션 실행
3. 버전 관리로 스키마 변경 추적

## Consequences

### Positive
- 완전한 타입 안전성
- 선언적 스키마 정의
- 자동 마이그레이션 생성
- SQL 디버깅 용이

### Negative
- Proxy 패턴 구현 필요 (초기 설정 복잡)
- 일부 Drizzle 기능 제한 (direct driver 접근 불가)
- Rust 측 SQL 실행 로직 필요

### 검증된 구현 예시
- [tauri-drizzle-sqlite-proxy-demo](https://github.com/tdwesten/tauri-drizzle-sqlite-proxy-demo)
- [tauri-drizzle-proxy](https://github.com/meditto/tauri-drizzle-proxy)

## References

- [Drizzle ORM SQLite Docs](https://orm.drizzle.team/docs/get-started-sqlite)
- [Drizzle + SQLite in Tauri App](https://huakun.tech/blogs/drizzle-+-sqlite-in-Tauri-App)
- [KeyPears: Drizzle SQLite Migrations in Tauri 2.0](https://keypears.com/blog/2025-10-04-drizzle-sqlite-tauri)
- [Building a Tauri v2 + Drizzle + SQLite App](https://dev.to/meddjelaili/building-a-tauri-v2-drizzle-sqlite-app-starter-template-15bm)
