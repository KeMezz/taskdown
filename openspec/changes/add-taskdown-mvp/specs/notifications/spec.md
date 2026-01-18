# notifications

마감일 알림 시스템

## ADDED Requirements

### Requirement: 알림 권한 요청

The system SHALL request notification permissions from the user.

#### Scenario: 최초 알림 권한 요청

- **GIVEN** 사용자가 마감일이 있는 태스크를 처음 생성함
- **WHEN** 알림 권한이 부여되지 않음
- **THEN** OS 알림 권한 요청 다이얼로그가 표시됨
- **AND** 권한 부여 시 알림이 활성화됨

#### Scenario: 권한 거부 시 안내

- **GIVEN** 사용자가 알림 권한을 거부함
- **WHEN** 마감일을 설정하려 함
- **THEN** 알림이 비활성화됨을 안내하는 메시지가 표시됨
- **AND** 설정에서 권한을 다시 요청할 수 있는 링크가 제공됨

### Requirement: 마감일 알림 생성

The system SHALL create reminders when due dates are set.

#### Scenario: 기본 알림 생성

- **GIVEN** 사용자가 태스크에 마감일을 설정함
- **WHEN** 마감일이 저장됨
- **THEN** 마감일 당일 기본 시간(설정값)에 알림이 예약됨
- **AND** reminders 테이블에 레코드가 생성됨

#### Scenario: 마감일 변경 시 알림 업데이트

- **GIVEN** 태스크에 마감일과 알림이 설정되어 있음
- **WHEN** 마감일을 변경함
- **THEN** 기존 알림이 삭제됨
- **AND** 새 마감일에 맞는 알림이 생성됨

#### Scenario: 마감일 삭제 시 알림 삭제

- **GIVEN** 태스크에 마감일과 알림이 설정되어 있음
- **WHEN** 마감일을 삭제함
- **THEN** 관련 알림도 함께 삭제됨

### Requirement: 알림 발송

The system SHALL send OS native notifications at scheduled times.

#### Scenario: 예약된 알림 발송

- **GIVEN** 알림이 예약되어 있음
- **WHEN** 예약 시간이 됨
- **THEN** OS 네이티브 알림이 표시됨
- **AND** 알림 제목에 "Taskdown"이 표시됨
- **AND** 알림 본문에 태스크 제목이 표시됨
- **AND** is_sent가 true로 업데이트됨

#### Scenario: 앱 실행 중 알림 체크

- **GIVEN** 앱이 실행 중
- **WHEN** 1분마다 알림 체크가 실행됨
- **THEN** 현재 시간 이전의 미발송 알림이 발송됨

#### Scenario: 앱 시작 시 누락 알림 처리

- **GIVEN** 앱이 종료된 동안 알림 시간이 지남
- **WHEN** 앱이 시작됨
- **THEN** 누락된 알림이 즉시 발송됨

### Requirement: 알림 커스터마이징

The system SHALL allow users to customize reminder times.

#### Scenario: 기본 알림 시간 설정

- **GIVEN** 사용자가 설정 화면에 있음
- **WHEN** 기본 알림 시간을 "09:00"에서 "08:00"으로 변경함
- **THEN** 새로 생성되는 알림에 해당 시간이 적용됨
- **AND** 기존 알림은 변경되지 않음

### Requirement: 완료된 태스크 알림 무시

The system SHALL not send notifications for completed tasks.

#### Scenario: 완료 태스크 알림 건너뛰기

- **GIVEN** 태스크에 알림이 예약되어 있음
- **WHEN** 알림 시간 전에 태스크가 Done으로 이동함
- **THEN** 해당 알림은 발송되지 않음
- **AND** is_sent가 true로 마킹됨 (또는 삭제됨)

## Dependencies

- [task-management](../task-management/spec.md): 태스크 마감일
- [vault-storage](../vault-storage/spec.md): 설정 저장
- Tauri plugin-notification
