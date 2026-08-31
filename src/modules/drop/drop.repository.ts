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
    l.*,
    c.name AS category_name,
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
LEFT JOIN categories c
    ON l.category_id = c.category_id
WHERE l.store_id = $1;

      `,
      [store_id],
    );
    return result.rows;
  }
  async getListingById(listing_id: string) {
    const result = await query(
      `
      SELECT
        l.*,
        c.name AS category_name,
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
      LEFT JOIN categories c
        ON l.category_id = c.category_id
      WHERE l.listing_id = $1
      LIMIT 1;
    `,
      [listing_id],
    );

    return result.rows[0] ?? null;
  }
}

export const dropRepository = new DropRepository();
