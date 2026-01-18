export { runMigrations, getMigrationStatus } from './migrations';
export type { MigrationResult } from './migrations';

export {
  selectVaultFolder,
  isValidVault,
  initializeVault,
  tryAutoLoadVault,
  loadVaultConfig,
  saveVaultConfig,
  loadAppConfig,
  saveAppConfig,
} from './vault';
export type { TaskdownConfig, AppConfig, VaultInitResult } from './vault';
