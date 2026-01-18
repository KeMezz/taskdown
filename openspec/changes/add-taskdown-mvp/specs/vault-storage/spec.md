# vault-storage

데이터 저장 및 Vault 관리 기능

## ADDED Requirements

### Requirement: Vault 폴더 선택

The system SHALL allow users to select a folder as their Vault for data storage.

#### Scenario: 최초 실행 시 Vault 선택

- **GIVEN** 사용자가 앱을 처음 실행함
- **WHEN** Vault 경로가 설정되지 않음
- **THEN** 폴더 선택 다이얼로그가 표시됨
- **AND** 사용자가 폴더를 선택하면 해당 경로가 저장됨

#### Scenario: Vault 경로 변경

- **GIVEN** 사용자가 설정 화면에 있음
- **WHEN** "Vault 변경" 버튼을 클릭함
- **THEN** 폴더 선택 다이얼로그가 표시됨
- **AND** 새 폴더 선택 시 해당 경로로 Vault가 변경됨

### Requirement: Vault 초기화

The system SHALL initialize the Vault folder structure when a new Vault is selected.

#### Scenario: 새 Vault 폴더 초기화

- **GIVEN** 사용자가 빈 폴더를 Vault로 선택함
- **WHEN** 폴더가 선택됨
- **THEN** `.taskdown/` 디렉토리가 생성됨
- **AND** `data.db` SQLite 파일이 생성됨
- **AND** `config.json` 설정 파일이 생성됨
- **AND** `assets/` 디렉토리가 생성됨

#### Scenario: 기존 Vault 열기

- **GIVEN** 사용자가 기존 Taskdown Vault 폴더를 선택함
- **WHEN** `.taskdown/data.db` 파일이 존재함
- **THEN** 기존 데이터를 로드함
- **AND** 필요 시 마이그레이션을 실행함

### Requirement: 데이터베이스 마이그레이션

The system SHALL automatically migrate the database schema when the app version changes.

#### Scenario: 스키마 버전 업그레이드

- **GIVEN** 앱이 시작됨
- **WHEN** 데이터베이스 스키마 버전이 앱 버전보다 낮음
- **THEN** 마이그레이션이 자동으로 실행됨
- **AND** 사용자 데이터가 보존됨

#### Scenario: 마이그레이션 실패 시 읽기 전용 모드

- **GIVEN** 앱이 시작되고 DB 마이그레이션이 실행됨
- **WHEN** 스키마 마이그레이션이 실패함
- **THEN** 앱이 읽기 전용 모드로 진입함
- **AND** 상단에 오류 배너와 "재시도" 버튼이 표시됨
- **AND** `data.db.backup` 파일이 자동 생성됨

### Requirement: 설정 저장

The system SHALL persist user preferences in the Vault config file.

#### Scenario: 테마 설정 저장

- **GIVEN** 사용자가 설정에서 테마를 변경함
- **WHEN** "다크 모드"를 선택함
- **THEN** `config.json`에 테마 설정이 저장됨
- **AND** 앱 재시작 시 설정이 유지됨

#### Scenario: 기본 알림 시간 설정

- **GIVEN** 사용자가 설정에서 기본 알림 시간을 변경함
- **WHEN** "09:00"에서 "08:00"으로 변경함
- **THEN** `config.json`에 알림 시간이 저장됨
- **AND** 새 알림 생성 시 해당 시간이 기본값으로 사용됨

### Requirement: 에셋 저장

The system SHALL store uploaded assets in the Vault assets folder.

#### Scenario: 이미지 파일 저장

- **GIVEN** 사용자가 태스크 에디터에서 이미지를 삽입함
- **WHEN** 로컬 이미지 파일을 선택함
- **THEN** 이미지가 `.taskdown/assets/`에 고유 파일명으로 복사됨
- **AND** 에디터에 해당 이미지가 표시됨

#### Scenario: 에셋 로드

- **GIVEN** 태스크에 이미지가 포함되어 있음
- **WHEN** 태스크 상세 화면을 열음
- **THEN** `.taskdown/assets/`에서 이미지를 로드하여 표시함

## Dependencies

- Tauri plugin-dialog (폴더 선택)
- Tauri plugin-sql (SQLite)
- Drizzle ORM (스키마 관리)
