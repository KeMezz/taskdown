# task-management

태스크 및 프로젝트 관리 기능

## ADDED Requirements

### Requirement: 태스크 생성

The system SHALL allow users to create tasks with a title.

#### Scenario: 빠른 태스크 생성 (Inbox)

- **GIVEN** 사용자가 Inbox 또는 프로젝트 뷰에 있음
- **WHEN** `⌘ + N`을 누르거나 "새 태스크" 버튼을 클릭함
- **THEN** 새 태스크 입력 필드가 나타남
- **AND** 제목 입력 후 Enter를 누르면 태스크가 생성됨
- **AND** 태스크 상태는 "backlog"로 설정됨

#### Scenario: 태스크 생성 시 프로젝트 할당

- **GIVEN** 사용자가 특정 프로젝트 뷰에 있음
- **WHEN** 새 태스크를 생성함
- **THEN** 해당 프로젝트에 태스크가 자동 할당됨

#### Scenario: Inbox에서 태스크 생성

- **GIVEN** 사용자가 Inbox 뷰에 있음
- **WHEN** 새 태스크를 생성함
- **THEN** 태스크의 project_id가 null로 설정됨 (Inbox 상태)

### Requirement: 태스크 조회

The system SHALL display tasks based on the selected view.

#### Scenario: Inbox 태스크 목록 조회

- **GIVEN** 사용자가 Inbox를 선택함
- **WHEN** 화면이 로드됨
- **THEN** project_id가 null인 태스크만 표시됨
- **AND** 태스크는 sort_order 순으로 정렬됨

#### Scenario: 프로젝트별 태스크 조회

- **GIVEN** 사용자가 특정 프로젝트를 선택함
- **WHEN** 화면이 로드됨
- **THEN** 해당 프로젝트의 태스크만 표시됨
- **AND** 칸반 컬럼별로 그룹화됨

### Requirement: 태스크 수정

The system SHALL allow users to edit task properties.

#### Scenario: 태스크 제목 수정

- **GIVEN** 사용자가 태스크 상세 패널을 열음
- **WHEN** 제목을 수정하고 포커스를 이동함
- **THEN** 변경사항이 자동 저장됨
- **AND** updated_at이 현재 시간으로 갱신됨

#### Scenario: 태스크 프로젝트 변경

- **GIVEN** 사용자가 태스크 상세 패널을 열음
- **WHEN** 프로젝트 드롭다운에서 다른 프로젝트를 선택함
- **THEN** 태스크가 새 프로젝트로 이동함
- **AND** Inbox에서 프로젝트로 이동 시 project_id가 설정됨

#### Scenario: 마감일 설정

- **GIVEN** 사용자가 태스크 상세 패널을 열음
- **WHEN** 마감일 필드에서 날짜를 선택함
- **THEN** due_date가 설정됨
- **AND** 기본 알림이 자동 생성됨 (config의 기본 시간 사용)

### Requirement: 태스크 삭제

The system SHALL allow users to delete tasks.

#### Scenario: 단일 태스크 삭제

- **GIVEN** 사용자가 태스크를 선택함
- **WHEN** 삭제 버튼을 클릭하고 확인함
- **THEN** 태스크가 데이터베이스에서 삭제됨
- **AND** 관련 알림도 함께 삭제됨 (cascade)

### Requirement: 프로젝트 생성

The system SHALL allow users to create projects to organize tasks.

#### Scenario: 새 프로젝트 생성

- **GIVEN** 사용자가 사이드바에 있음
- **WHEN** `⌘ + ⇧ + N`을 누르거나 "새 프로젝트" 버튼을 클릭함
- **THEN** 프로젝트 이름 입력 다이얼로그가 표시됨
- **AND** 이름 입력 후 프로젝트가 생성됨

#### Scenario: 프로젝트 색상 지정

- **GIVEN** 프로젝트 생성 또는 편집 중
- **WHEN** 색상 선택기에서 색상을 선택함
- **THEN** 프로젝트에 해당 색상이 적용됨
- **AND** 사이드바와 칸반에서 색상이 표시됨

### Requirement: 프로젝트 수정

The system SHALL allow users to edit project properties.

#### Scenario: 프로젝트 이름 변경

- **GIVEN** 사용자가 프로젝트를 우클릭함
- **WHEN** "이름 변경"을 선택하고 새 이름을 입력함
- **THEN** 프로젝트 이름이 변경됨

### Requirement: 프로젝트 삭제

The system SHALL allow users to delete projects.

#### Scenario: 프로젝트 삭제 시 태스크 처리

- **GIVEN** 프로젝트에 태스크가 있음
- **WHEN** 프로젝트를 삭제함
- **THEN** 확인 다이얼로그가 표시됨
- **AND** 확인 시 프로젝트가 삭제됨
- **AND** 소속 태스크의 project_id가 null로 변경됨 (Inbox로 이동)

## Dependencies

- [vault-storage](../vault-storage/spec.md): 데이터 저장
