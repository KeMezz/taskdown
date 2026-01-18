import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { invoke } from '@tauri-apps/api/core';
import * as schema from '@taskdown/db';

export const db = drizzle(
  async (sql, params, method) => {
    try {
      const result = await invoke<unknown[]>('run_sql', {
        sql,
        params,
        method, // 'run' | 'all' | 'get'
      });
      return { rows: result };
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
