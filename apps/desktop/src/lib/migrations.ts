/**
 * 마이그레이션 실행 모듈
 * 앱 시작 시 스키마 마이그레이션을 자동으로 실행
 */

import { invoke } from '@tauri-apps/api/core';
import { db } from '../db';
import { migrations, migrationDefinitions, type MigrationDefinition } from '@taskdown/db';
import { desc } from 'drizzle-orm';

export interface MigrationResult {
  success: boolean;
  appliedMigrations: number[];
  error?: string;
}

/**
 * Raw SQL 실행 (마이그레이션용)
 */
async function executeRawSql(sql: string): Promise<void> {
  await invoke('run_sql', {
    sql,
    params: [],
    method: 'run',
  });
}

/**
 * 현재 적용된 최신 마이그레이션 버전 조회
 */
async function getCurrentVersion(): Promise<number> {
  try {
    const result = await db
      .select({ version: migrations.version })
      .from(migrations)
      .orderBy(desc(migrations.version))
      .limit(1);

    return result.length > 0 && result[0]?.version != null ? result[0].version : 0;
  } catch {
    // migrations 테이블이 없는 경우 (최초 실행)
    return 0;
  }
}

/**
 * 단일 마이그레이션 실행
 */
async function applyMigration(migration: MigrationDefinition): Promise<void> {
  // SQL 문을 세미콜론으로 분리하여 개별 실행
  const statements = migration.sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    await executeRawSql(statement);
  }

  // 마이그레이션 적용 기록
  await db.insert(migrations).values({
    version: migration.version,
    name: migration.name,
    appliedAt: new Date(),
  });
}

/**
 * 모든 미적용 마이그레이션 실행
 */
export async function runMigrations(): Promise<MigrationResult> {
  const appliedMigrations: number[] = [];

  try {
    const currentVersion = await getCurrentVersion();
    const pendingMigrations = migrationDefinitions
      .filter((m) => m.version > currentVersion)
      .sort((a, b) => a.version - b.version);

    if (pendingMigrations.length === 0) {
      return { success: true, appliedMigrations: [] };
    }

    for (const migration of pendingMigrations) {
      await applyMigration(migration);
      appliedMigrations.push(migration.version);
      console.log(`Migration ${migration.version} (${migration.name}) applied successfully`);
    }

    return { success: true, appliedMigrations };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown migration error';
    console.error('Migration failed:', errorMessage);
    return {
      success: false,
      appliedMigrations,
      error: errorMessage,
    };
  }
}

/**
 * 마이그레이션 상태 조회
 */
export async function getMigrationStatus(): Promise<{
  currentVersion: number;
  pendingCount: number;
  appliedMigrations: { version: number; name: string; appliedAt: Date }[];
}> {
  const currentVersion = await getCurrentVersion();
  const pendingCount = migrationDefinitions.filter((m) => m.version > currentVersion).length;

  let appliedMigrations: { version: number; name: string; appliedAt: Date }[] = [];
  try {
    appliedMigrations = await db
      .select({
        version: migrations.version,
        name: migrations.name,
        appliedAt: migrations.appliedAt,
      })
      .from(migrations)
      .orderBy(desc(migrations.version));
  } catch {
    // 테이블이 없는 경우
  }

  return {
    currentVersion,
    pendingCount,
    appliedMigrations,
  };
}
