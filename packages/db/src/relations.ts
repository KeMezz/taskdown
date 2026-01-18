import { relations } from 'drizzle-orm';
import { projects, tasks, reminders } from './schema';

/**
 * 프로젝트 관계 정의
 * 프로젝트 : 태스크 = 1 : N
 */
export const projectsRelations = relations(projects, ({ many }) => ({
  tasks: many(tasks),
}));

/**
 * 태스크 관계 정의
 * 태스크 : 프로젝트 = N : 1
 * 태스크 : 리마인더 = 1 : N
 */
export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  reminders: many(reminders),
}));

/**
 * 리마인더 관계 정의
 * 리마인더 : 태스크 = N : 1
 */
export const remindersRelations = relations(reminders, ({ one }) => ({
  task: one(tasks, {
    fields: [reminders.taskId],
    references: [tasks.id],
  }),
}));
