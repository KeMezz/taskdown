export { runMigrations, getMigrationStatus } from './migrations';
export type { MigrationResult } from './migrations';

export {
  getVaultPath,
  isValidVault,
  initializeVault,
  tryAutoLoadVault,
  loadVaultConfig,
  saveVaultConfig,
  loadAppConfig,
  saveAppConfig,
} from './vault';
export type { TaskdownConfig, AppConfig, VaultInitResult } from './vault';

export { QueryProvider, queryClient } from './queryClient';
export { queryKeys } from './queryKeys';
