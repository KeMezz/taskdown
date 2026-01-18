# ADR-003: 마크다운 에디터 선택

## Status
**Accepted**

## Context

각 태스크에 마크다운 노트를 작성할 수 있는 WYSIWYG 에디터가 필요하다.

### 요구사항
- WYSIWYG 스타일 편집 (마크다운 문법 숨김)
- 체크리스트, 코드 블록, 이미지 지원
- React 통합
- 가벼운 번들 크기
- 확장 가능

### 검토한 대안들

| 라이브러리 | 기반 | UI 포함 | 번들 크기 | 유연성 |
|-----------|------|---------|----------|--------|
| **TipTap** | ProseMirror | ❌ | ~50KB (core) | 높음 |
| BlockNote | TipTap | ✅ | ~200KB | 중간 |
| Lexical | Facebook | ❌ | ~30KB | 높음 |
| CKEditor 5 | 자체 | ✅ | ~500KB+ | 중간 |
| TinyMCE | 자체 | ✅ | ~500KB+ | 중간 |

## Decision

**TipTap을 마크다운 에디터로 사용한다.**

```json
{
  "dependencies": {
    "@tiptap/react": "^2.6.0",
    "@tiptap/starter-kit": "^2.6.0",
    "@tiptap/extension-task-list": "^2.6.0",
    "@tiptap/extension-task-item": "^2.6.0",
    "@tiptap/extension-image": "^2.6.0",
    "@tiptap/extension-code-block-lowlight": "^2.6.0"
  }
}
```

## Rationale

### TipTap 선택 이유

1. **유연성**: 필요한 기능만 선택적으로 포함 (tree-shakable)
2. **ProseMirror 기반**: 검증된 에디터 프레임워크 위에 구축
3. **커스텀 UI**: Taskdown의 디자인 언어에 맞춤 가능
4. **확장성**: Phase 2+에서 백링크 등 고급 기능 추가 용이
5. **활발한 개발**: 정기적인 업데이트와 좋은 문서화

### BlockNote를 선택하지 않은 이유

BlockNote는 Notion 스타일 블록 에디터로 빠른 개발이 가능하지만:
- 커스터마이징 한계
- 추가 번들 크기
- TipTap 위에 구축되어 있어 직접 TipTap 사용이 더 유연

### Lexical을 선택하지 않은 이유

Facebook의 Lexical은 가볍고 성능이 좋지만:
- TipTap보다 낮은 수준의 API (더 많은 구현 필요)
- 마크다운/WYSIWYG 기능 직접 구현 필요
- 상대적으로 작은 플러그인 생태계

### 구현 계획

```typescript
// 필요한 익스텐션만 포함
const editor = useEditor({
  extensions: [
    StarterKit,           // 기본 기능
    TaskList,             // 체크리스트
    TaskItem,
    Image,                // 이미지
    CodeBlockLowlight,    // 코드 하이라이팅
  ],
})
```

## Consequences

### Positive
- 완전한 UI 커스터마이징 가능
- 필요한 기능만 포함하여 번들 최적화
- 풍부한 익스텐션 생태계

### Negative
- 툴바, 메뉴 등 UI 직접 구현 필요
- ProseMirror 개념 이해 필요 (고급 커스터마이징 시)
- 접근성(a11y) 직접 구현 필요

### 추후 검토 사항
- Phase 4에서 백링크/그래프 뷰 구현 시 TipTap 확장 필요
- 성능 모니터링 (대용량 문서 처리)

## References

- [TipTap Documentation](https://tiptap.dev)
- [Which rich text editor framework should you choose in 2025?](https://liveblocks.io/blog/which-rich-text-editor-framework-should-you-choose-in-2025)
- [TipTap vs Alternatives](https://tiptap.dev/alternatives)
