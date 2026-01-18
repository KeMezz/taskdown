/**
 * Vault 설정 화면
 * 앱 최초 실행 시 또는 Vault가 없을 때 표시
 */

import { useState } from 'react';
import { useAppStore } from '../../stores';
import { selectVaultFolder, initializeVault } from '../../lib';

export function VaultSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setVaultPath, setInitialized, setInitializing, setReadOnlyMode } = useAppStore();

  const handleSelectFolder = async () => {
    try {
      setIsLoading(true);
      setInitializing(true);
      setError(null);

      const selectedPath = await selectVaultFolder();
      if (!selectedPath) {
        setIsLoading(false);
        setInitializing(false);
        return;
      }

      const result = await initializeVault(selectedPath);

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
      let errorMessage = '알 수 없는 오류가 발생했습니다.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else {
        try {
          errorMessage = JSON.stringify(err);
        } catch {
          errorMessage = '알 수 없는 오류가 발생했습니다.';
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setInitializing(false);
    }
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
          <p className="text-gray-600">GTD 기반 할 일 관리와 마크다운 노트를 결합한 로컬 우선 앱</p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="font-medium text-gray-900 mb-2">Vault 폴더를 선택하세요</h2>
            <p className="text-sm text-gray-600">
              모든 데이터는 선택한 폴더 안에 저장됩니다. 클라우드 드라이브 폴더를 선택하면 자동으로
              백업됩니다.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleSelectFolder}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                초기화 중...
              </span>
            ) : (
              '폴더 선택'
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Vault 폴더 안에 <code className="bg-gray-100 px-1 rounded">.taskdown</code> 폴더가
            생성됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
