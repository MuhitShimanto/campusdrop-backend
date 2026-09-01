import { PoolClient } from 'pg';
import { query, transaction } from '../../database/query.js';
import { Drop } from './drop.model.js';
import { CreateAlwaysOnInput, CreatePreOrderInput } from './store.schema.js';

class DropRepository {
  async createListing(
    input: (CreatePreOrderInput | CreateAlwaysOnInput) & { listing_id: string; store_id: string },
    client: PoolClient,
  ) {
    const result = await client.query<Drop>(
      `
    INSERT INTO listings (
      listing_id,
      store_id,
      category_id,
      listing_type,
      name,
      description,
      price,
      status,
      fulfillment_mode,
      pickup_location,
      pickup_starts_at,
      pickup_ends_at
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12
    )
    RETURNING listing_id, listing_type, name, status, price, fulfillment_mode, pickup_location, pickup_starts_at, pickup_ends_at
    `,
      [
        input.listing_id,
        input.store_id,
        input.category_id,
        input.listing_type,
        input.name,
        input.description,
        input.price,
        input.status,
        input.fulfillment_mode,
        input.pickup_location,
        input.pickup_starts_at,
        input.pickup_ends_at,
      ],
    );
    return result.rows[0] || null;
  }
  async createPreOrder(input: CreatePreOrderInput & { listing_id: string; store_id: string }) {
    return transaction(async (client) => {
      const listing = await this.createListing(input, client);

      if (!listing) {
        return null;
      }

      await client.query(
        `
      INSERT INTO listing_preorder_details (
        listing_id,
        order_start_time,
        order_end_time
      )
      VALUES ($1, $2, $3)
    `,
        [input.listing_id, input.order_start_time, input.order_end_time],
      );

      return listing;
    });
  }

  async createAlwaysOn(input: CreateAlwaysOnInput & { listing_id: string; store_id: string }) {
    return transaction(async (client) => {
      const listing = await this.createListing(input, client);

      if (!listing) {
        return null;
      }

      await client.query(
        `
        INSERT INTO listing_alwayson_details (listing_id, estimated_delivery_days)
        VALUES ($1, $2)
      `,
        [input.listing_id, input.estimated_delivery_days],
      );

      return listing;
    });
  }
  async getMyListings(store_id: string) {
  const result = await query(
    `
      SELECT
        s.store_id, s.name, s.slug,
        COALESCE(
          json_agg(
            json_build_object(
              'listing_id', l.listing_id,
              'listing_type', l.listing_type,
              'name', l.name,
              'description', l.description,
              'price', l.price,
              'status', l.status,
              'fulfillment_mode', l.fulfillment_mode,
              'pickup_location', l.pickup_location,
              'pickup_starts_at', l.pickup_starts_at,
              'pickup_ends_at', l.pickup_ends_at,
              'deleted_at', l.deleted_at,
              'category_name', c.name,
              'images', COALESCE(
                (
                  SELECT json_agg(
                    json_build_object(
                      'url', i.url,
                      'sort_order', i.sort_order
                    )
                    ORDER BY i.sort_order
                  )
                  FROM listing_images i
                  WHERE i.listing_id = l.listing_id
                ),
                '[]'::json
              )
            )
            ORDER BY l.created_at DESC
          ) FILTER (WHERE l.listing_id IS NOT NULL),
          '[]'::json
        ) AS drops
      FROM stores s
      LEFT JOIN listings l
        ON l.store_id = s.store_id
      LEFT JOIN categories c
        ON l.category_id = c.category_id
      WHERE s.store_id = $1
      GROUP BY s.store_id;
    `,
    [store_id],
  );

  return result.rows[0] ?? null;
}


  async getAlwaysOnListingById(listing_id: string) {
    const result = await query(
      `
        SELECT
        l.listing_id,
        l.listing_type,
        l.name,
        l.description,
        l.price,
        l.status,
        l.fulfillment_mode,
        l.pickup_location,
        l.pickup_starts_at,
        l.pickup_ends_at,
        l.deleted_at,
        a.estimated_delivery_days,

        c.name AS category_name,

        json_build_object(
            'store_id', s.store_id,
            'name', s.name,
            'slug', s.slug
        ) AS store,

        COALESCE(
            (
            SELECT json_agg(
                json_build_object(
                'url', i.url,
                'sort_order', i.sort_order
                )
                ORDER BY i.sort_order
            )
            FROM listing_images i
            WHERE i.listing_id = l.listing_id
            ),
            '[]'::json
        ) AS images

        FROM listings l
        JOIN listing_alwayson_details a
        ON l.listing_id = a.listing_id
        LEFT JOIN categories c
        ON l.category_id = c.category_id
        LEFT JOIN stores s
        ON l.store_id = s.store_id
        WHERE l.listing_id = $1
        LIMIT 1;
    `,
      [listing_id],
    );

    return result.rows[0] ?? null;
  }
  async getPreOrderListingById(listing_id: string) {
    const result = await query(
      `
        SELECT
        l.listing_id,
        l.listing_type,
        l.name,
        l.description,
        l.price,
        l.status,
        l.fulfillment_mode,
        l.pickup_location,
        l.pickup_starts_at,
        l.pickup_ends_at,
        l.deleted_at,
        p.order_start_time,
        p.order_end_time,

        c.name AS category_name,

        json_build_object(
            'store_id', s.store_id,
            'name', s.name,
            'slug', s.slug
        ) AS store,

        COALESCE(
            (
            SELECT json_agg(
                json_build_object(
                'url', i.url,
                'sort_order', i.sort_order
                )
                ORDER BY i.sort_order
            )
            FROM listing_images i
            WHERE i.listing_id = l.listing_id
            ),
            '[]'::json
        ) AS images

        FROM listings l
        JOIN listing_preorder_details p ON l.listing_id = p.listing_id
        LEFT JOIN categories c
        ON l.category_id = c.category_id
        LEFT JOIN stores s
        ON l.store_id = s.store_id
        WHERE l.listing_id = $1
        LIMIT 1;
    `,
      [listing_id],
    );

    return result.rows[0] ?? null;
  }
  
  async getPreOrders(limit: number, sortBy: string) {
    const result = await query(
        `
        SELECT
            l.listing_id,
            l.listing_type,
            l.status,
            l.name,
            l.description,
            l.price,
            i.url AS image_url,
            c.name AS category_name,
            l.fulfillment_mode,
            l.pickup_location,
            l.pickup_starts_at,
            l.pickup_ends_at,
            p.order_start_time,
            p.order_end_time,
            s.slug AS store_slug,
            s.store_id AS store_id

        FROM listings l
        JOIN listing_preorder_details p ON l.listing_id = p.listing_id
        JOIN stores s ON l.store_id = s.store_id
        JOIN categories c ON l.category_id = c.category_id
        JOIN listing_images i ON l.listing_id = i.listing_id AND i.sort_order = 1
        WHERE l.listing_type = 'preorder' AND l.status = 'active' AND l.deleted_at IS NULL
        ORDER BY ${sortBy || 'l.created_at'} DESC
        LIMIT $1
        `,
        [limit],
    );

    return result.rows;
  }
  async getAlwaysOn(limit: number, sortBy: string) {
    const result = await query(
        `
        SELECT
            l.listing_id,
            l.listing_type,
            l.status,
            l.name,
            l.description,
            l.price,
            i.url AS image_url,
            c.name AS category_name,
            l.fulfillment_mode,
            l.pickup_location,
            l.pickup_starts_at,
            l.pickup_ends_at,
            s.slug AS store_slug,
            s.store_id AS store_id,
            a.estimated_delivery_days
        FROM listings l
        JOIN listing_alwayson_details a ON l.listing_id = a.listing_id
        JOIN stores s ON l.store_id = s.store_id
        JOIN categories c ON l.category_id = c.category_id
        JOIN listing_images i ON l.listing_id = i.listing_id AND i.sort_order = 1
        WHERE l.listing_type = 'always_on' AND l.status = 'active' AND l.deleted_at IS NULL
        ORDER BY ${sortBy || 'l.created_at'} DESC
        LIMIT $1
        `,
        [limit],
    );

    return result.rows;
  }
  async getListingTypeById(listing_id: string) {
    const result = await query(
      `
        SELECT listing_type
        FROM listings
        WHERE listing_id = $1
        LIMIT 1;
      `,
      [listing_id],
    );
    return result.rows[0]?.listing_type || null;
  }
}

export const dropRepository = new DropRepository();
