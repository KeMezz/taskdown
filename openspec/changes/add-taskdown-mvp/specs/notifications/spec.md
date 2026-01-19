# notifications

마감일 알림 시스템

## ADDED Requirements

### Requirement: 알림 권한 요청

The system SHALL request notification permissions from the user.

#### Scenario: 앱 시작 시 알림 권한 요청

- **GIVEN** 사용자가 앱을 처음 실행함
- **WHEN** 알림 권한이 부여되지 않음 (default 상태)
- **THEN** OS 알림 권한 요청 다이얼로그가 자동으로 표시됨
- **AND** 권한 부여 시 알림이 활성화됨

#### Scenario: 권한 거부 시 안내

- **GIVEN** 사용자가 알림 권한을 거부함
- **WHEN** 설정 화면을 확인함
- **THEN** 알림이 비활성화됨을 안내하는 메시지가 표시됨
- **AND** 설정에서 권한을 다시 요청할 수 있는 버튼이 제공됨

#### Scenario: 테스트 알림 발송

- **GIVEN** 사용자가 설정 화면에 있음
- **WHEN** "테스트 알림 보내기" 버튼을 클릭함
- **THEN** OS 네이티브 테스트 알림이 발송됨
- **AND** 성공/실패 결과가 UI에 표시됨

### Requirement: 태스크별 알림 생성

The system SHALL allow users to create reminders for individual tasks.

#### Scenario: 알림 추가

- **GIVEN** 사용자가 태스크 상세 패널을 열었음
- **WHEN** 알림 시간(날짜+시간)을 선택하고 "추가" 버튼을 클릭함
- **THEN** reminders 테이블에 레코드가 생성됨
- **AND** 알림 목록에 새 알림이 표시됨

#### Scenario: 알림 삭제

- **GIVEN** 태스크에 알림이 설정되어 있음
- **WHEN** 알림 옆 삭제(X) 버튼을 클릭함
- **THEN** 해당 알림이 삭제됨
- **AND** 알림 목록에서 제거됨

#### Scenario: 복수 알림 지원

- **GIVEN** 태스크에 알림이 설정되어 있음
- **WHEN** 새로운 알림 시간을 추가함
- **THEN** 기존 알림은 유지됨
- **AND** 새 알림이 추가됨

#### Scenario: 과거 시간 알림 방지

- **GIVEN** 사용자가 알림을 추가하려 함
- **WHEN** 현재 시간보다 과거의 시간을 선택함
- **THEN** 알림이 생성되지 않음
- **AND** 경고 메시지가 표시됨

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

### Requirement: 완료된 태스크 알림 무시

The system SHALL not send notifications for completed tasks.

#### Scenario: 완료 태스크 알림 건너뛰기

- **GIVEN** 태스크에 알림이 예약되어 있음
- **WHEN** 알림 시간 전에 태스크가 Done으로 이동함
- **THEN** 해당 알림은 발송되지 않음
- **AND** is_sent가 true로 마킹됨 (또는 삭제됨)

## Dependencies

- [task-management](../task-management/spec.md): 태스크 마감일
- Tauri plugin-notification
