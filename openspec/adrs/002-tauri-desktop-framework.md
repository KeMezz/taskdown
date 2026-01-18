# ADR-002: Tauri 데스크톱 프레임워크

## Status
**Accepted**

## Context

로컬 우선 데스크톱 앱을 구축하기 위한 프레임워크가 필요하다.

### 검토한 대안들

| 프레임워크 | 번들 크기 | 메모리 사용 | 모바일 지원 | 언어 |
|-----------|----------|------------|------------|------|
| **Tauri 2.0** | ~3MB | ~50MB | ✅ iOS/Android | Rust |
| Electron | ~150MB | ~300MB+ | ❌ | Node.js |
| Neutralino | ~3MB | ~50MB | ❌ | C++ |
| Wails | ~10MB | ~80MB | ❌ | Go |

### Tauri 2.0 현황 (2026년 1월)
- 2024년 10월 안정 버전 출시
- 현재 버전: 2.9.5
- 활발한 개발 및 커뮤니티

## Decision

**Tauri 2.0을 데스크톱 프레임워크로 사용한다.**

## Rationale

### 선택 이유

1. **번들 크기**: ~3MB로 Electron 대비 50배 이상 작음
2. **메모리 효율**: 시스템 WebView 사용으로 메모리 사용량 최소화
3. **모바일 확장성**: Phase 1.5에서 iOS/Android 지원 가능
4. **보안**: Rust 기반으로 메모리 안전성 보장
5. **네이티브 기능**: 플러그인 시스템으로 OS 기능 접근
   - `@tauri-apps/plugin-sql`: SQLite
   - `@tauri-apps/plugin-notification`: 알림
   - `@tauri-apps/plugin-dialog`: 파일 다이얼로그

### 리스크 및 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 상대적으로 젊은 생태계 | 중간 | 문서화된 패턴 우선 사용 |
| Rust 학습 곡선 | 낮음 | 프론트엔드 중심 개발, Rust는 플러그인 수준 |
| macOS WebView 차이 | 중간 | Safari 기준 CSS 테스트 |

### Electron 대신 Tauri를 선택한 이유

1. **앱 크기**: 사용자 다운로드/설치 경험 개선
2. **시작 속도**: 목표 < 2초 달성 가능
3. **리소스 사용**: 백그라운드 실행 시에도 가벼움
4. **미래 확장**: 동일 코드베이스로 모바일 앱 가능

## Consequences

### Positive
- 가벼운 앱 번들과 빠른 시작
- 모바일 확장 경로 확보
- 네이티브 수준의 성능

### Negative
- Electron보다 작은 생태계
- macOS WebView(Safari) 기준 개발 필요
- 일부 고급 기능은 Rust 코드 필요

## References

- [Tauri 2.0 Stable Release](https://v2.tauri.app/blog/tauri-20/)
- [Tauri Releases](https://github.com/tauri-apps/tauri/releases)
- [Tauri Plugin System](https://v2.tauri.app/develop/plugins/)
