import { useEffect, useState } from 'react';
import { useAppStore, useSidebarStore } from './stores';
import { tryAutoLoadVault, QueryProvider } from './lib';
import { VaultSetup } from './features/vault';
import { MainLayout } from './features/layout';
import { InboxView } from './views/InboxView';
import { ProjectView } from './views/ProjectView';
import { SettingsView } from './views/SettingsView';

function AppContent() {
  const { isReadOnly, migrationError } = useAppStore();
  const { currentView, selectedProjectId } = useSidebarStore();

  const renderView = () => {
    switch (currentView) {
      case 'inbox':
        return <InboxView />;
      case 'project':
        return <ProjectView projectId={selectedProjectId} />;
      case 'settings':
        return <SettingsView />;
      default:
        return <InboxView />;
    }
  };

  return (
    <MainLayout>
      {isReadOnly && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <p className="text-sm text-yellow-800">
            <span className="font-medium">읽기 전용 모드:</span> {migrationError}
          </p>
        </div>
      )}
      {renderView()}
    </MainLayout>
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

  return (
    <QueryProvider>
      <AppContent />
    </QueryProvider>
  );
}

export default App;
