// Schema exports
export { projects, tasks, reminders, migrations } from './schema';

// Relations exports
export {
  projectsRelations,
  tasksRelations,
  remindersRelations,
} from './relations';

// Type exports
export type {
  Project,
  Task,
  Reminder,
  Migration,
  NewProject,
  NewTask,
  NewReminder,
  NewMigration,
  TaskStatus,
  UpdateProject,
  UpdateTask,
  UpdateReminder,
} from './types';

// Migrations exports
export { migrations as migrationDefinitions } from './migrations';
export type { MigrationDefinition } from './migrations';
