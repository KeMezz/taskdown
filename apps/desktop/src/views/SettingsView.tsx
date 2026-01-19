import { useState, useEffect } from 'react';
import { useAppStore } from '../stores';
import { loadVaultConfig, saveVaultConfig, type TaskdownConfig } from '../lib/vault';
import { requestNotificationPermission } from '../features/notifications';

export function SettingsView() {
  const { vaultPath, notificationPermission, setNotificationPermission } = useAppStore();
  const [config, setConfig] = useState<TaskdownConfig | null>(null);
  const [defaultReminderTime, setDefaultReminderTime] = useState('09:00');
  const [isSaving, setIsSaving] = useState(false);

  // Vault 설정 불러오기
  useEffect(() => {
    async function loadConfig() {
      if (!vaultPath) return;
      const loadedConfig = await loadVaultConfig(vaultPath);
      if (loadedConfig) {
        setConfig(loadedConfig);
        setDefaultReminderTime(loadedConfig.defaultReminderTime || '09:00');
      }
    }
    loadConfig();
  }, [vaultPath]);

  // 알림 시간 변경 핸들러
  const handleReminderTimeChange = async (newTime: string) => {
    setDefaultReminderTime(newTime);

    if (!vaultPath || !config) return;

    setIsSaving(true);
    try {
      const newConfig: TaskdownConfig = {
        ...config,
        defaultReminderTime: newTime,
      };
      await saveVaultConfig(vaultPath, newConfig);
      setConfig(newConfig);
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 알림 권한 요청 핸들러
  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
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
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4">
        <h2 className="text-lg font-semibold text-gray-900">설정</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-8">
          {/* Vault 설정 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Vault 설정
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Vault 경로</p>
                <p className="text-sm text-gray-500 mt-1 break-all">{vaultPath || '설정되지 않음'}</p>
                <p className="text-xs text-gray-400 mt-2">
                  앱 데이터 폴더에 자동으로 저장됩니다.
                </p>
              </div>
            </div>
          </section>

          {/* 알림 설정 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              알림 설정
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
              {/* 알림 권한 상태 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">알림 권한</p>
                  <p className="text-sm text-gray-500 mt-1">OS 알림 표시 권한</p>
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
                      className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      권한 요청
                    </button>
                  )}
                </div>
              </div>

              {/* 권한 거부 시 안내 */}
              {notificationPermission === 'denied' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    알림 권한이 거부되었습니다. 마감일 알림을 받으려면 시스템 설정에서 Taskdown의 알림 권한을 허용해주세요.
                  </p>
                </div>
              )}

              {/* 기본 알림 시간 */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-700">기본 알림 시간</p>
                  <p className="text-sm text-gray-500 mt-1">마감일 당일 알림 시간</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={defaultReminderTime}
                    onChange={(e) => handleReminderTimeChange(e.target.value)}
                    disabled={isSaving}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                  />
                  {isSaving && (
                    <span className="text-xs text-gray-500">저장 중...</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 앱 정보 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              앱 정보
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">버전</span>
                  <span className="text-sm text-gray-700">1.0.0-alpha</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">빌드</span>
                  <span className="text-sm text-gray-700">MVP</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
