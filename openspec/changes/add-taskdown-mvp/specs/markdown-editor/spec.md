# markdown-editor

태스크 노트용 마크다운 에디터

## ADDED Requirements

### Requirement: WYSIWYG 마크다운 편집

The system SHALL provide a WYSIWYG-style markdown editor for task notes.

#### Scenario: 태스크 노트 편집

- **GIVEN** 사용자가 태스크 상세 패널을 열음
- **WHEN** 에디터 영역을 클릭함
- **THEN** 커서가 활성화되고 텍스트 입력이 가능함
- **AND** 마크다운 문법이 실시간으로 렌더링됨

#### Scenario: 실시간 저장

- **GIVEN** 사용자가 노트를 편집 중
- **WHEN** 입력이 멈춘 후 500ms가 경과함
- **THEN** 변경사항이 자동 저장됨 (디바운스)
- **AND** 저장 상태 인디케이터가 표시됨

### Requirement: 기본 텍스트 서식

The system SHALL support basic text formatting.

#### Scenario: 헤딩 적용

- **GIVEN** 에디터에 텍스트가 있음
- **WHEN** 텍스트를 선택하고 H1-H6 서식을 적용함
- **THEN** 해당 텍스트가 헤딩으로 표시됨

#### Scenario: Bold/Italic 적용

- **GIVEN** 에디터에 텍스트가 있음
- **WHEN** 텍스트를 선택하고 `⌘ + B` 또는 `⌘ + I`를 누름
- **THEN** 해당 텍스트가 굵게/기울임으로 표시됨

#### Scenario: 취소선 적용

- **GIVEN** 에디터에 텍스트가 있음
- **WHEN** 텍스트를 선택하고 취소선 서식을 적용함
- **THEN** 해당 텍스트에 취소선이 표시됨

### Requirement: 리스트 지원

The system SHALL support ordered and unordered lists.

#### Scenario: 순서 없는 리스트

- **GIVEN** 에디터에서 새 줄을 시작함
- **WHEN** `-` 또는 `*`를 입력하고 스페이스를 누름
- **THEN** 순서 없는 리스트 아이템이 생성됨
- **AND** Enter 시 다음 리스트 아이템이 생성됨

#### Scenario: 순서 있는 리스트

- **GIVEN** 에디터에서 새 줄을 시작함
- **WHEN** `1.`을 입력하고 스페이스를 누름
- **THEN** 순서 있는 리스트 아이템이 생성됨
- **AND** 번호가 자동으로 증가함

### Requirement: 체크리스트 지원

The system SHALL support interactive checklists.

#### Scenario: 체크리스트 생성

- **GIVEN** 에디터에서 새 줄을 시작함
- **WHEN** `- [ ]`를 입력하고 스페이스를 누름
- **THEN** 체크박스가 있는 리스트 아이템이 생성됨

#### Scenario: 체크박스 토글

- **GIVEN** 체크리스트 아이템이 있음
- **WHEN** 체크박스를 클릭함
- **THEN** 체크 상태가 토글됨 (`[ ]` ↔ `[x]`)
- **AND** 완료된 아이템에 취소선이 표시됨

### Requirement: 코드 블록 지원

The system SHALL support code blocks with syntax highlighting.

#### Scenario: 코드 블록 생성

- **GIVEN** 에디터에서 새 줄을 시작함
- **WHEN** ` ``` `를 입력함
- **THEN** 코드 블록이 생성됨
- **AND** 언어 선택 드롭다운이 표시됨

#### Scenario: 신택스 하이라이팅

- **GIVEN** 코드 블록에 언어가 지정됨 (예: javascript)
- **WHEN** 코드를 입력함
- **THEN** 해당 언어의 신택스 하이라이팅이 적용됨

#### Scenario: 인라인 코드

- **GIVEN** 에디터에 텍스트가 있음
- **WHEN** 텍스트를 백틱(`)으로 감쌈
- **THEN** 해당 텍스트가 인라인 코드로 표시됨

### Requirement: 이미지 삽입

The system SHALL allow users to insert images into notes.

#### Scenario: 이미지 파일 삽입

- **GIVEN** 사용자가 에디터에서 이미지 삽입을 시도함
- **WHEN** 로컬 이미지 파일을 선택함
- **THEN** 이미지가 Vault의 assets 폴더에 복사됨
- **AND** 에디터에 이미지가 표시됨

#### Scenario: 이미지 드래그앤드롭

- **GIVEN** 사용자가 이미지 파일을 가지고 있음
- **WHEN** 이미지를 에디터 영역으로 드래그앤드롭함
- **THEN** 이미지가 삽입됨

#### Scenario: 클립보드에서 이미지 붙여넣기

- **GIVEN** 클립보드에 이미지가 있음
- **WHEN** 에디터에서 `⌘ + V`를 누름
- **THEN** 이미지가 삽입됨

### Requirement: 링크 지원

The system SHALL support hyperlinks.

#### Scenario: 링크 생성

- **GIVEN** 에디터에 텍스트가 있음
- **WHEN** 텍스트를 선택하고 `⌘ + K`를 누름
- **THEN** URL 입력 다이얼로그가 표시됨
- **AND** URL 입력 후 링크가 생성됨

#### Scenario: 링크 클릭

- **GIVEN** 노트에 링크가 있음
- **WHEN** `⌘ + 클릭`으로 링크를 클릭함
- **THEN** 기본 브라우저에서 해당 URL이 열림

### Requirement: 기타 마크다운 요소

The system SHALL support additional markdown elements.

#### Scenario: 인용문

- **GIVEN** 에디터에서 새 줄을 시작함
- **WHEN** `>`를 입력하고 스페이스를 누름
- **THEN** 인용문 블록이 생성됨

#### Scenario: 수평선

- **GIVEN** 에디터에서 새 줄을 시작함
- **WHEN** `---`를 입력하고 Enter를 누름
- **THEN** 수평선이 삽입됨

## Dependencies

- TipTap 에디터
- [vault-storage](../vault-storage/spec.md): 이미지 저장
