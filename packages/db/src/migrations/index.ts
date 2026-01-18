/**
 * 마이그레이션 정의
 * 각 마이그레이션은 version, name, sql을 포함
 */

export interface MigrationDefinition {
  version: number;
  name: string;
  sql: string;
}

const sql0001 = `
-- Migration: 0001_initial
-- Created: 2026-01-18
-- Description: Initial schema for Taskdown MVP

-- Migrations tracking table (must be first)
CREATE TABLE IF NOT EXISTS migrations (
  version INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  applied_at INTEGER NOT NULL
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '{}',
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'next', 'waiting', 'done')),
  due_date INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY NOT NULL,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  remind_at INTEGER NOT NULL,
  is_sent INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_task_id ON reminders(task_id);
CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders(remind_at);
`;

export const migrations: MigrationDefinition[] = [
  {
    version: 1,
    name: 'initial',
    sql: sql0001,
  },
];
