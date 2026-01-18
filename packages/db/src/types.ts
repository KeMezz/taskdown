import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { projects, tasks, reminders, migrations } from './schema';

// Select types (DB에서 조회된 데이터)
export type Project = InferSelectModel<typeof projects>;
export type Task = InferSelectModel<typeof tasks>;
export type Reminder = InferSelectModel<typeof reminders>;
export type Migration = InferSelectModel<typeof migrations>;

// Insert types (DB에 삽입할 데이터)
export type NewProject = InferInsertModel<typeof projects>;
export type NewTask = InferInsertModel<typeof tasks>;
export type NewReminder = InferInsertModel<typeof reminders>;
export type NewMigration = InferInsertModel<typeof migrations>;

// Task status enum type
export type TaskStatus = 'backlog' | 'next' | 'waiting' | 'done';

// Update types (부분 업데이트용)
export type UpdateProject = Partial<Omit<NewProject, 'id' | 'createdAt'>>;
export type UpdateTask = Partial<Omit<NewTask, 'id' | 'createdAt'>>;
export type UpdateReminder = Partial<Omit<NewReminder, 'id' | 'taskId' | 'createdAt'>>;
