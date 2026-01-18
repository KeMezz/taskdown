import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createTestDb, cleanupTestDb, type TestDb } from "./testing";
import { projects, tasks, reminders } from "./schema";
import { eq } from "drizzle-orm";

describe("Schema", () => {
  let testDb: TestDb;

  beforeEach(() => {
    testDb = createTestDb();
  });

  afterEach(() => {
    cleanupTestDb(testDb);
  });

  describe("projects", () => {
    it("should create a project", () => {
      const now = new Date();
      const project = testDb.db
        .insert(projects)
        .values({
          id: "proj-1",
          name: "Test Project",
          createdAt: now,
          updatedAt: now,
        })
        .returning()
        .get();

      expect(project.id).toBe("proj-1");
      expect(project.name).toBe("Test Project");
      expect(project.color).toBe("#6366f1");
    });

    it("should use default values", () => {
      const now = new Date();
      const project = testDb.db
        .insert(projects)
        .values({
          id: "proj-2",
          name: "Project with Defaults",
          createdAt: now,
          updatedAt: now,
        })
        .returning()
        .get();

      expect(project.sortOrder).toBe(0);
      expect(project.color).toBe("#6366f1");
      expect(project.icon).toBeNull();
    });
  });

  describe("tasks", () => {
    it("should create a task", () => {
      const now = new Date();
      const task = testDb.db
        .insert(tasks)
        .values({
          id: "task-1",
          title: "Test Task",
          createdAt: now,
          updatedAt: now,
        })
        .returning()
        .get();

      expect(task.id).toBe("task-1");
      expect(task.title).toBe("Test Task");
      expect(task.status).toBe("backlog");
    });

    it("should link task to project", () => {
      const now = new Date();

      // Create project first
      testDb.db.insert(projects).values({
        id: "proj-1",
        name: "Test Project",
        createdAt: now,
        updatedAt: now,
      }).run();

      // Create task linked to project
      const task = testDb.db
        .insert(tasks)
        .values({
          id: "task-1",
          title: "Linked Task",
          projectId: "proj-1",
          createdAt: now,
          updatedAt: now,
        })
        .returning()
        .get();

      expect(task.projectId).toBe("proj-1");
    });
  });

  describe("reminders", () => {
    it("should create a reminder for a task", () => {
      const now = new Date();
      const remindAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later

      // Create task first
      testDb.db.insert(tasks).values({
        id: "task-1",
        title: "Task with Reminder",
        createdAt: now,
        updatedAt: now,
      }).run();

      // Create reminder
      const reminder = testDb.db
        .insert(reminders)
        .values({
          id: "rem-1",
          taskId: "task-1",
          remindAt,
          createdAt: now,
        })
        .returning()
        .get();

      expect(reminder.id).toBe("rem-1");
      expect(reminder.taskId).toBe("task-1");
      expect(reminder.isSent).toBe(false);
    });
  });
});
