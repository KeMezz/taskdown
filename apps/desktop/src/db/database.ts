import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { invoke } from '@tauri-apps/api/core';
import * as schema from '@taskdown/db';

export const db = drizzle(
  async (sql, params, method) => {
    try {
      const result = await invoke<unknown>('run_sql', {
        sql,
        params,
        method, // 'run' | 'all' | 'get' | 'values'
      });

      if (method === 'run') {
        const changes =
          typeof result === 'object' && result !== null && 'changes' in result
            ? (result as { changes?: number }).changes
            : undefined;
        return changes === undefined ? { rows: [] } : { rows: [], changes };
      }

      if (method === 'get') {
        const rows = result === null ? [] : [result];
        return { rows: rows as unknown[] };
      }

      return { rows: Array.isArray(result) ? result : [] };
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  },
  { schema }
);

export async function initDatabase(dbPath: string): Promise<void> {
  await invoke('init_database', { path: dbPath });
}

export { schema };
