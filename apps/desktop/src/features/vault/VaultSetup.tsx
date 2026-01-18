/**
 * Vault 설정 화면
 * 앱 최초 실행 시 자동 초기화 진행
 */

import { useEffect, useState } from 'react';
import { useAppStore } from '../../stores';
import { getVaultPath, initializeVault } from '../../lib';

export function VaultSetup() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setVaultPath, setInitialized, setInitializing, setReadOnlyMode } = useAppStore();

  const initVault = async () => {
    try {
      setIsLoading(true);
      setInitializing(true);
      setError(null);

      const vaultPath = await getVaultPath();
      const result = await initializeVault(vaultPath);

      if (!result.success) {
        setError(result.error || '알 수 없는 오류가 발생했습니다.');
        setIsLoading(false);
        setInitializing(false);
        return;
      }

      setVaultPath(result.vaultPath!);

      if (result.isReadOnly) {
        setReadOnlyMode(result.error || '마이그레이션에 실패했습니다.');
      }

      setInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setInitializing(false);
    }
  };

  useEffect(() => {
    initVault();
  }, []);

  const handleRetry = () => {
    initVault();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Taskdown</h1>
          <p className="text-gray-600">
            GTD 기반 할 일 관리와 마크다운 노트를 결합한 로컬 우선 앱
          </p>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-indigo-600" viewBox="0 0 24 24">
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
                <span className="text-gray-700">초기화 중...</span>
              </div>
              <p className="text-sm text-gray-500 text-center mt-2">
                앱 데이터 폴더에 Vault를 설정하고 있습니다.
              </p>
            </div>
          ) : error ? (
            <>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>

              <button
                onClick={handleRetry}
                className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              >
                다시 시도
              </button>
            </>
          ) : null}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            데이터는 앱 데이터 폴더에 자동으로 저장됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
