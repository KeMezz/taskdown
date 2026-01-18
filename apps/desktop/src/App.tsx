import { useEffect, useState } from 'react';
import { useAppStore } from './stores';
import { tryAutoLoadVault } from './lib';
import { VaultSetup } from './features/vault';

function AppContent() {
  const { isReadOnly, migrationError, vaultPath } = useAppStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {isReadOnly && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <p className="text-sm text-yellow-800">
            <span className="font-medium">읽기 전용 모드:</span> {migrationError}
          </p>
        </div>
      )}
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Taskdown</h1>
          <p className="text-gray-600 mb-2">GTD 기반 할 일 관리 앱</p>
          <p className="text-sm text-gray-500">Vault: {vaultPath}</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { isInitialized, setVaultPath, setInitialized, setReadOnlyMode, setInitializing } =
    useAppStore();

  useEffect(() => {
    async function initApp() {
      try {
        setInitializing(true);

        // 이전에 사용한 Vault 자동 로드 시도
        const result = await tryAutoLoadVault();

        if (result?.success && result.vaultPath) {
          setVaultPath(result.vaultPath);

          if (result.isReadOnly && result.error) {
            setReadOnlyMode(result.error);
          }

          setInitialized(true);
        }
      } catch (error) {
        console.error('Failed to auto-load vault:', error);
      } finally {
        setIsLoading(false);
        setInitializing(false);
      }
    }

    initApp();
  }, [setVaultPath, setInitialized, setReadOnlyMode, setInitializing]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return <VaultSetup />;
  }

  return <AppContent />;
}

export default App;
