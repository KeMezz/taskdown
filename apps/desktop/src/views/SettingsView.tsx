import { useAppStore } from '../stores';

export function SettingsView() {
  const { vaultPath } = useAppStore();

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Vault 경로</h3>
          <p className="text-sm text-gray-500 font-mono bg-gray-50 px-3 py-2 rounded">
            {vaultPath}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">버전</h3>
          <p className="text-sm text-gray-500">Taskdown v0.1.0 (MVP)</p>
        </div>
      </div>
    </div>
  );
}
