import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * 프로젝트 테이블
 * 태스크를 그룹화하는 프로젝트 정보
 */
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(), // nanoid
  name: text('name').notNull(),
  color: text('color').default('#6366f1'),
  icon: text('icon'),
  sortOrder: integer('sort_order').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

/**
 * 태스크 테이블
 * 개별 태스크 정보 (칸반 보드의 카드)
 */
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(), // nanoid
  title: text('title').notNull(),
  content: text('content').default('{}'), // TipTap JSON
  projectId: text('project_id').references(() => projects.id, {
    onDelete: 'set null',
  }),
  status: text('status', {
    enum: ['backlog', 'next', 'waiting', 'done'],
  }).default('backlog'),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  sortOrder: integer('sort_order').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

/**
 * 리마인더 테이블
 * 태스크에 연결된 알림 정보
 */
export const reminders = sqliteTable('reminders', {
  id: text('id').primaryKey(), // nanoid
  taskId: text('task_id')
    .references(() => tasks.id, { onDelete: 'cascade' })
    .notNull(),
  remindAt: integer('remind_at', { mode: 'timestamp' }).notNull(),
  isSent: integer('is_sent', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

/**
 * 마이그레이션 버전 관리 테이블
 * 적용된 스키마 마이그레이션 기록
 */
export const migrations = sqliteTable('migrations', {
  version: integer('version').primaryKey(),
  name: text('name').notNull(),
  appliedAt: integer('applied_at', { mode: 'timestamp' }).notNull(),
});
