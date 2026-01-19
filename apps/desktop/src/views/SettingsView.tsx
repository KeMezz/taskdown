import { useState } from 'react';
import { useAppStore } from '../stores';
import type { ThemeMode } from '../stores';
import {
  requestNotificationPermission,
  sendTaskNotification,
} from '../features/notifications';

const THEME_OPTIONS: { value: ThemeMode; label: string; description: string }[] = [
  { value: 'system', label: '시스템', description: '시스템 설정을 따릅니다' },
  { value: 'light', label: '라이트', description: '밝은 테마' },
  { value: 'dark', label: '다크', description: '어두운 테마' },
];

const DEFAULT_REMINDER_TIMES = [
  { value: '06:00', label: '오전 6시' },
  { value: '07:00', label: '오전 7시' },
  { value: '08:00', label: '오전 8시' },
  { value: '09:00', label: '오전 9시' },
  { value: '10:00', label: '오전 10시' },
  { value: '12:00', label: '정오' },
  { value: '14:00', label: '오후 2시' },
  { value: '18:00', label: '오후 6시' },
  { value: '20:00', label: '오후 8시' },
  { value: '21:00', label: '오후 9시' },
];

export function SettingsView() {
  const {
    vaultPath,
    notificationPermission,
    setNotificationPermission,
    theme,
    setTheme,
    defaultReminderTime,
    setDefaultReminderTime,
  } = useAppStore();
  const [isTestingSending, setIsTestingSending] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'failed' | null>(null);

  // 알림 권한 요청 핸들러
  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
  };

  // 테스트 알림 발송 핸들러
  const handleTestNotification = async () => {
    setIsTestingSending(true);
    setTestResult(null);

    try {
      const success = await sendTaskNotification('테스트 알림', {
        body: '알림이 정상적으로 작동합니다!',
      });
      setTestResult(success ? 'success' : 'failed');
    } catch {
      setTestResult('failed');
    } finally {
      setIsTestingSending(false);
    }

    // 3초 후 결과 메시지 숨기기
    setTimeout(() => setTestResult(null), 3000);
  };

  // 알림 권한 상태 표시 텍스트
  const getPermissionStatusText = () => {
    switch (notificationPermission) {
      case 'granted':
        return '허용됨';
      case 'denied':
        return '거부됨';
      case 'default':
        return '설정되지 않음';
      default:
        return '확인 중...';
    }
  };

  // 알림 권한 상태 색상
  const getPermissionStatusColor = () => {
    switch (notificationPermission) {
      case 'granted':
        return 'text-green-600 bg-green-50';
      case 'denied':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">설정</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-8">
          {/* Vault 설정 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
              Vault 설정
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Vault 경로</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 break-all">{vaultPath || '설정되지 않음'}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  앱 데이터 폴더에 자동으로 저장됩니다.
                </p>
              </div>
            </div>
          </section>

          {/* 알림 설정 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
              알림 설정
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
              {/* 알림 권한 상태 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">알림 권한</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">OS 알림 표시 권한</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getPermissionStatusColor()}`}
                  >
                    {getPermissionStatusText()}
                  </span>
                  {notificationPermission !== 'granted' && (
                    <button
                      onClick={handleRequestPermission}
                      className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    >
                      권한 요청
                    </button>
                  )}
                </div>
              </div>

              {/* 권한 거부 시 안내 */}
              {notificationPermission === 'denied' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    알림 권한이 거부되었습니다. 마감일 알림을 받으려면 시스템 설정에서 Taskdown의 알림 권한을 허용해주세요.
                  </p>
                </div>
              )}

              {/* 기본 알림 시간 설정 */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">기본 알림 시간</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    마감일 알림의 기본 시간
                  </p>
                </div>
                <select
                  value={defaultReminderTime}
                  onChange={(e) => setDefaultReminderTime(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {DEFAULT_REMINDER_TIMES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 테스트 알림 */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">테스트 알림</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">알림이 정상 작동하는지 확인</p>
                </div>
                <div className="flex items-center gap-3">
                  {testResult === 'success' && (
                    <span className="text-sm text-green-600">전송 성공!</span>
                  )}
                  {testResult === 'failed' && (
                    <span className="text-sm text-red-600">전송 실패</span>
                  )}
                  <button
                    onClick={handleTestNotification}
                    disabled={isTestingSending}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isTestingSending ? '전송 중...' : '테스트 알림 보내기'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 테마 설정 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
              테마 설정
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="grid grid-cols-3 gap-3">
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                      theme === opt.value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full mb-2 flex items-center justify-center ${
                        opt.value === 'light'
                          ? 'bg-yellow-100 text-yellow-600'
                          : opt.value === 'dark'
                          ? 'bg-gray-700 text-gray-200'
                          : 'bg-gradient-to-r from-yellow-100 to-gray-700'
                      }`}
                    >
                      {opt.value === 'light' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                        </svg>
                      )}
                      {opt.value === 'dark' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                        </svg>
                      )}
                      {opt.value === 'system' && (
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M2.25 5.25a3 3 0 013-3h13.5a3 3 0 013 3V15a3 3 0 01-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 01-.53 1.28h-9a.75.75 0 01-.53-1.28l.621-.622a2.25 2.25 0 00.659-1.59V18h-3a3 3 0 01-3-3V5.25zm1.5 0v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      theme === opt.value
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {opt.label}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {opt.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 앱 정보 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
              앱 정보
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">버전</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">1.0.0-alpha</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">빌드</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">MVP</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
