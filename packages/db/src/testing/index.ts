import Database, { type Database as DatabaseType } from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../schema";
import { sql } from "drizzle-orm";

export interface TestDb {
  db: BetterSQLite3Database<typeof schema>;
  sqlite: DatabaseType;
}

/**
 * 테스트용 in-memory SQLite 데이터베이스를 생성합니다.
 */
export function createTestDb(): TestDb {
  const sqlite = new Database(":memory:");
  const db = drizzle(sqlite, { schema });

  // 테이블 생성
  db.run(sql`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#6366f1',
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  db.run(sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT DEFAULT '{}',
      project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
      status TEXT DEFAULT 'backlog' CHECK(status IN ('backlog', 'next', 'waiting', 'done')),
      due_date INTEGER,
      sort_order INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  db.run(sql`
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      remind_at INTEGER NOT NULL,
      is_sent INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    )
  `);

  db.run(sql`
    CREATE TABLE IF NOT EXISTS migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at INTEGER NOT NULL
    )
  `);

  return { db, sqlite };
}

/**
 * 테스트 데이터베이스를 정리합니다.
 */
export function cleanupTestDb(testDb: TestDb) {
  testDb.sqlite.close();
}
