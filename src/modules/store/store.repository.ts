import { query } from '../../database/query.js';
import { Store } from './store.model.js';
import { CreateStoreInput } from './store.schema.js';

class StoreRepository {
  async getStore(user_id: string) {
    const result = await query<Store>(
      `SELECT * FROM stores
            WHERE user_id = $1`,
      [user_id],
    );
    return result.rows[0] ?? null;
  }
  async isStoreSlugAvailable(slug: string) {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM stores WHERE slug = $1`,
      [slug],
    );
    return result.rows[0]?.count === '0';
  }
  async createStore(store_id: string, user_id: string, data: CreateStoreInput) {
    const result = await query<Store>(
      `INSERT INTO stores (store_id, user_id, name, slug, avatar, cover, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [store_id, user_id, data.name, data.slug, data.avatar, data.cover, data.description],
    );
    return result.rows[0];
  }
  async update(user_id: string, data: Partial<CreateStoreInput>) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const result = await query<Store>(
      `UPDATE stores SET ${setClause} WHERE user_id = $${values.length + 1} RETURNING *`,
      [...values, user_id],
    );
    return result.rows[0];
  }
  async getStoreWithOwnerBySlug(slug: string) {
    const result = await query<Store>(
      `SELECT
        jsonb_build_object(
            'user_id', u.user_id,
            'name', u.name,
            'avatar', u.avatar,
            'slug', u.slug
        ) AS "user",
        jsonb_build_object(
            'store_id', s.store_id,
            'name', s.name,
            'slug', s.slug,
            'avatar', s.avatar,
            'cover', s.cover,
            'description', s.description
        ) AS "store"
      FROM stores s
      JOIN users u
          ON s.user_id = u.user_id
      WHERE s.slug = $1;`,
      [slug],
    );
    return result.rows[0] ?? null;
  }
}

export const storeRepository = new StoreRepository();
