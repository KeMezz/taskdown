/**
 * Vault 관리 모듈
 * Vault 폴더 선택, 초기화, 설정 관리
 */

import { open } from '@tauri-apps/plugin-dialog';
import { exists, mkdir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { join, appDataDir } from '@tauri-apps/api/path';
import { initDatabase } from '../db';
import { runMigrations } from './migrations';

const TASKDOWN_DIR = '.taskdown';
const CONFIG_FILE = 'config.json';
const DB_FILE = 'data.db';
const ASSETS_DIR = 'assets';
const APP_CONFIG_FILE = 'app-config.json';

export interface TaskdownConfig {
  version: string;
  theme: 'light' | 'dark' | 'system';
  defaultReminderTime: string;
  createdAt: string;
}

export interface AppConfig {
  lastVaultPath: string | null;
}

export interface VaultInitResult {
  success: boolean;
  vaultPath?: string;
  error?: string;
  isReadOnly?: boolean;
}

/**
 * 기본 Taskdown 설정
 */
function getDefaultConfig(): TaskdownConfig {
  return {
    version: '1.0.0',
    theme: 'system',
    defaultReminderTime: '09:00',
    createdAt: new Date().toISOString(),
  };
}

/**
 * 앱 설정 파일 경로 가져오기
 */
async function getAppConfigPath(): Promise<string> {
  const appData = await appDataDir();
  return await join(appData, APP_CONFIG_FILE);
}

/**
 * 앱 설정 저장 (마지막 Vault 경로 등)
 */
export async function saveAppConfig(config: AppConfig): Promise<void> {
  const configPath = await getAppConfigPath();
  await writeTextFile(configPath, JSON.stringify(config, null, 2));
}

/**
 * 앱 설정 불러오기
 */
export async function loadAppConfig(): Promise<AppConfig | null> {
  try {
    const configPath = await getAppConfigPath();
    const fileExists = await exists(configPath);
    if (!fileExists) {
      return null;
    }
    const content = await readTextFile(configPath);
    return JSON.parse(content) as AppConfig;
  } catch (error) {
    console.error('Failed to load app config:', error);
    return null;
  }
}

/**
 * Vault 폴더 선택 다이얼로그 열기
 */
export async function selectVaultFolder(): Promise<string | null> {
  const selected = await open({
    directory: true,
    multiple: false,
    title: 'Taskdown Vault 폴더 선택',
  });

  if (selected && typeof selected === 'string') {
    return selected;
  }
  return null;
}

/**
 * Vault 폴더 구조 확인
 */
export async function isValidVault(vaultPath: string): Promise<boolean> {
  try {
    const taskdownDir = await join(vaultPath, TASKDOWN_DIR);
    const dbPath = await join(taskdownDir, DB_FILE);
    return await exists(dbPath);
  } catch {
    return false;
  }
}

/**
 * Vault 초기화 (폴더 구조 생성)
 */
async function initializeVaultStructure(vaultPath: string): Promise<void> {
  const taskdownDir = await join(vaultPath, TASKDOWN_DIR);
  const assetsDir = await join(taskdownDir, ASSETS_DIR);

  // .taskdown 폴더 생성
  const taskdownExists = await exists(taskdownDir);
  if (!taskdownExists) {
    await mkdir(taskdownDir, { recursive: true });
  }

  // assets 폴더 생성
  const assetsExists = await exists(assetsDir);
  if (!assetsExists) {
    await mkdir(assetsDir, { recursive: true });
  }

  // config.json 생성
  const configPath = await join(taskdownDir, CONFIG_FILE);
  const configExists = await exists(configPath);
  if (!configExists) {
    const defaultConfig = getDefaultConfig();
    await writeTextFile(configPath, JSON.stringify(defaultConfig, null, 2));
  }
}

/**
 * Vault 설정 불러오기
 */
export async function loadVaultConfig(vaultPath: string): Promise<TaskdownConfig | null> {
  try {
    const configPath = await join(vaultPath, TASKDOWN_DIR, CONFIG_FILE);
    const content = await readTextFile(configPath);
    return JSON.parse(content) as TaskdownConfig;
  } catch {
    return null;
  }
}

/**
 * Vault 설정 저장하기
 */
export async function saveVaultConfig(
  vaultPath: string,
  config: TaskdownConfig
): Promise<void> {
  const configPath = await join(vaultPath, TASKDOWN_DIR, CONFIG_FILE);
  await writeTextFile(configPath, JSON.stringify(config, null, 2));
}

/**
 * Vault 초기화 및 데이터베이스 연결
 */
export async function initializeVault(vaultPath: string): Promise<VaultInitResult> {
  try {
    // 1. Vault 구조 초기화
    await initializeVaultStructure(vaultPath);

    // 2. 데이터베이스 경로 설정
    const dbPath = await join(vaultPath, TASKDOWN_DIR, DB_FILE);

    // 3. 데이터베이스 초기화
    await initDatabase(dbPath);

    // 4. 마이그레이션 실행
    const migrationResult = await runMigrations();

    if (!migrationResult.success) {
      return {
        success: true,
        vaultPath,
        isReadOnly: true,
        error: migrationResult.error,
      };
    }

    // 5. 앱 설정에 마지막 Vault 경로 저장
    await saveAppConfig({ lastVaultPath: vaultPath });

    return {
      success: true,
      vaultPath,
      isReadOnly: false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to initialize vault:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 앱 시작 시 Vault 자동 로드 시도
 */
export async function tryAutoLoadVault(): Promise<VaultInitResult | null> {
  const appConfig = await loadAppConfig();

  if (!appConfig?.lastVaultPath) {
    return null;
  }

  const isValid = await isValidVault(appConfig.lastVaultPath);
  if (!isValid) {
    return null;
  }

  return await initializeVault(appConfig.lastVaultPath);
}
