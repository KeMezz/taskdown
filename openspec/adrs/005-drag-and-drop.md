# ADR-005: 드래그앤드롭 라이브러리

## Status
**Accepted**

## Context

칸반 보드에서 태스크를 컬럼 간/컬럼 내 드래그앤드롭으로 이동해야 한다.

### 요구사항
- 컬럼 간 아이템 이동
- 컬럼 내 순서 변경
- 부드러운 애니메이션
- 키보드 접근성
- React 19 호환

### 검토한 대안들

| 라이브러리 | 유지보수 | 유연성 | 칸반 적합성 | 번들 크기 |
|-----------|---------|--------|------------|----------|
| **dnd-kit** | ✅ 활발 | 높음 | ✅ | ~30KB |
| hello-pangea/dnd | ✅ 포크 | 중간 | ✅✅ | ~40KB |
| react-dnd | ✅ | 높음 | ⚠️ | ~20KB |
| pragmatic-drag-and-drop | ✅ Atlassian | 높음 | ✅ | ~15KB |

## Decision

**dnd-kit을 드래그앤드롭 라이브러리로 사용한다.**

```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.0"
  }
}
```

## Rationale

### dnd-kit 선택 이유

1. **유연성**: 칸반 보드의 복잡한 상호작용 커스터마이징 가능
2. **성능**: 효율적인 렌더링, 60fps 유지
3. **DragOverlay**: 드래그 중 커스텀 미리보기 (React Portal 활용)
4. **충돌 감지**: 다양한 충돌 감지 전략 제공
5. **정렬 전략**: 수직/수평/그리드 정렬 모두 지원
6. **활발한 유지보수**: 정기적인 업데이트

### hello-pangea/dnd를 선택하지 않은 이유

hello-pangea/dnd (react-beautiful-dnd 포크)는 칸반에 특화되어 있지만:
- 커스터마이징 제한 (드래그 동작 변경 어려움)
- 유연성이 낮아 향후 요구사항 변경 대응 어려움
- dnd-kit으로 동일한 결과를 약간의 추가 코드로 달성 가능

### 구현 패턴

```tsx
// 칸반 보드 기본 구조
<DndContext
  sensors={sensors}
  collisionDetection={closestCorners}
  onDragEnd={handleDragEnd}
>
  {columns.map(column => (
    <SortableContext
      key={column.id}
      items={column.taskIds}
      strategy={verticalListSortingStrategy}
    >
      <Column column={column}>
        {column.tasks.map(task => (
          <SortableTask key={task.id} task={task} />
        ))}
      </Column>
    </SortableContext>
  ))}

  <DragOverlay>
    {activeTask && <TaskCard task={activeTask} />}
  </DragOverlay>
</DndContext>
```

### 접근성

dnd-kit은 기본적인 키보드 접근성을 제공:
- Space/Enter: 드래그 시작/종료
- 방향키: 아이템 이동
- Escape: 드래그 취소

## Consequences

### Positive
- 완전한 제어권 (드래그 동작, 애니메이션, 제약조건)
- 모듈화된 구조로 필요한 기능만 포함
- 다양한 센서 지원 (마우스, 터치, 키보드)
- 성능 최적화 옵션

### Negative
- hello-pangea/dnd보다 초기 코드량 많음
- 기본 UI 없음 (직접 구현)
- 충돌 감지 전략 선택 필요

### 성능 고려사항
- `useSensors`로 드래그 활성화 조건 최적화
- `DragOverlay`로 리렌더링 최소화
- 가상화와 함께 사용 시 주의 필요

## References

- [dnd-kit Documentation](https://dndkit.com/)
- [Build a Kanban board with dnd kit and React](https://blog.logrocket.com/build-kanban-board-dnd-kit-react/)
- [Top 5 Drag-and-Drop Libraries for React in 2025](https://dev.to/puckeditor/top-5-drag-and-drop-libraries-for-react-24lb)
