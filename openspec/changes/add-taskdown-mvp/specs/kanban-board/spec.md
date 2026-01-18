# kanban-board

칸반 보드 UI 및 상호작용

## ADDED Requirements

### Requirement: 칸반 보드 표시

The system SHALL display tasks in a 4-column Kanban board.

#### Scenario: 프로젝트 칸반 보드 렌더링

- **GIVEN** 사용자가 프로젝트를 선택함
- **WHEN** 칸반 보드가 렌더링됨
- **THEN** 4개의 컬럼이 표시됨: Backlog, Next, Waiting, Done
- **AND** 각 컬럼에 해당 상태의 태스크가 표시됨
- **AND** 각 컬럼 헤더에 태스크 개수가 표시됨

#### Scenario: 태스크 카드 표시

- **GIVEN** 태스크가 칸반 보드에 있음
- **WHEN** 카드가 렌더링됨
- **THEN** 태스크 제목이 표시됨
- **AND** 마감일이 있으면 표시됨
- **AND** 마감일이 지났으면 강조 표시됨

### Requirement: 드래그앤드롭 상태 변경

The system SHALL allow users to change task status via drag and drop.

#### Scenario: 컬럼 간 태스크 이동

- **GIVEN** 태스크가 Backlog 컬럼에 있음
- **WHEN** 사용자가 태스크를 Next 컬럼으로 드래그함
- **THEN** 태스크의 status가 "next"로 변경됨
- **AND** 드롭된 위치에 맞게 sort_order가 업데이트됨

#### Scenario: 컬럼 내 순서 변경

- **GIVEN** 컬럼에 여러 태스크가 있음
- **WHEN** 사용자가 태스크를 같은 컬럼 내에서 드래그함
- **THEN** 태스크 순서가 변경됨
- **AND** 영향받는 태스크들의 sort_order가 업데이트됨

#### Scenario: 드래그 미리보기

- **GIVEN** 사용자가 태스크를 드래그 중
- **WHEN** 드래그가 시작됨
- **THEN** 드래그 중인 태스크의 미리보기가 커서를 따라 이동함
- **AND** 원래 위치에 placeholder가 표시됨

### Requirement: 태스크 상세 열기

The system SHALL allow users to open task details from the Kanban board.

#### Scenario: 태스크 클릭으로 상세 열기

- **GIVEN** 칸반 보드에 태스크가 있음
- **WHEN** 사용자가 태스크 카드를 클릭함
- **THEN** 오른쪽에서 태스크 상세 패널이 슬라이드 인됨
- **AND** 태스크 제목, 프로젝트, 마감일, 노트가 표시됨

#### Scenario: 상세 패널 닫기

- **GIVEN** 태스크 상세 패널이 열려 있음
- **WHEN** 사용자가 Esc를 누르거나 닫기 버튼을 클릭함
- **THEN** 패널이 슬라이드 아웃됨

### Requirement: 빈 컬럼 상태 표시

The system SHALL show helpful messages for empty columns.

#### Scenario: 빈 컬럼 안내 메시지

- **GIVEN** 컬럼에 태스크가 없음
- **WHEN** 컬럼이 렌더링됨
- **THEN** 해당 컬럼에 대한 안내 메시지가 표시됨
- **AND** 드롭 가능 영역이 표시됨

### Requirement: 키보드 접근성

The system SHALL support keyboard navigation for the Kanban board.

#### Scenario: 키보드로 태스크 이동

- **GIVEN** 태스크에 포커스가 있음
- **WHEN** Space 또는 Enter로 드래그 모드를 활성화함
- **THEN** 방향키로 태스크를 이동할 수 있음
- **AND** Space 또는 Enter로 드롭함

## Dependencies

- [task-management](../task-management/spec.md): 태스크 CRUD
- dnd-kit 라이브러리
