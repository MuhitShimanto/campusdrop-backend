import type { PoolClient, QueryResult, QueryResultRow } from 'pg';

import { pool } from './pool.js';

export const query = async <T extends QueryResultRow = QueryResultRow>(
  text: string,
  values?: unknown[],
): Promise<QueryResult<T>> => {
  return pool.query<T>(text, values);
};
export const transaction = async <T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await callback(client);

    await client.query('COMMIT');

    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
