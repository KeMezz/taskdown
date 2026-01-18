import { useAppStore } from '../stores';

interface SettingsViewProps {
  onChangeVault?: () => void;
}

export function SettingsView({ onChangeVault }: SettingsViewProps) {
  const { vaultPath } = useAppStore();

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
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Vault 경로</p>
                  <p className="text-sm text-gray-500 mt-1 break-all">{vaultPath || '설정되지 않음'}</p>
                </div>
                {onChangeVault && (
                  <button
                    onClick={onChangeVault}
                    className="px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    변경
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* 알림 설정 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              알림 설정
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">기본 알림 시간</p>
                  <p className="text-sm text-gray-500 mt-1">마감일 당일 알림 시간</p>
                </div>
                <input
                  type="time"
                  defaultValue="09:00"
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
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
