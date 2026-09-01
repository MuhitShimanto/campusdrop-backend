import { query } from '../../database/query.js';
import { Store } from './store.model.js';
import { CreateStoreInput } from './store.schema.js';

class StoreRepository {
  async getStore(user_id: string) {
    const result = await query<Store>(
      `
    SELECT * FROM stores
    WHERE user_id = $1;
    `,
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
      `
      SELECT
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
        ) AS "store",

        jsonb_build_object(
          'always_on',
          COALESCE(
            (
              SELECT jsonb_agg(
                DISTINCT jsonb_build_object(
                  'listing_id', l.listing_id,
                  'listing_type', l.listing_type,
                  'status', l.status,
                  'name', l.name,
                  'description', l.description,
                  'price', l.price,
                  'image_url', i.url,
                  'category_name', c.name,
                  'fulfillment_mode', l.fulfillment_mode,
                  'pickup_location', l.pickup_location,
                  'pickup_starts_at', l.pickup_starts_at,
                  'pickup_ends_at', l.pickup_ends_at,
                  'estimated_delivery_days', a.estimated_delivery_days
                )
              )
              FROM listings l
              JOIN categories c
                ON l.category_id = c.category_id
              LEFT JOIN listing_images i
                ON l.listing_id = i.listing_id
                AND i.sort_order = 1
              LEFT JOIN listing_alwayson_details a
                ON l.listing_id = a.listing_id
              WHERE l.store_id = s.store_id
                AND l.deleted_at IS NULL
                AND l.status = 'active'
                AND l.listing_type = 'always_on'
            ),
            '[]'::jsonb
          ),

          'preorder',
          COALESCE(
            (
              SELECT jsonb_agg(
                DISTINCT jsonb_build_object(
                  'listing_id', l.listing_id,
                  'listing_type', l.listing_type,
                  'status', l.status,
                  'name', l.name,
                  'description', l.description,
                  'price', l.price,
                  'image_url', i.url,
                  'category_name', c.name,
                  'fulfillment_mode', l.fulfillment_mode,
                  'pickup_location', l.pickup_location,
                  'pickup_starts_at', l.pickup_starts_at,
                  'pickup_ends_at', l.pickup_ends_at,
                  'order_start_time', p.order_start_time,
                  'order_end_time', p.order_end_time
                )
              )
              FROM listings l
              JOIN categories c
                ON l.category_id = c.category_id
              LEFT JOIN listing_images i
                ON l.listing_id = i.listing_id
                AND i.sort_order = 1
              LEFT JOIN listing_preorder_details p
                ON l.listing_id = p.listing_id
              WHERE l.store_id = s.store_id
                AND l.deleted_at IS NULL
                AND l.status = 'active'
                AND l.listing_type = 'preorder'
            ),
            '[]'::jsonb
          )
        ) AS "listings"

      FROM stores s
      JOIN users u
        ON s.user_id = u.user_id
      WHERE s.slug = $1;
`,
      [slug],
    );
    return result.rows[0] ?? null;
  }
}

export const storeRepository = new StoreRepository();
