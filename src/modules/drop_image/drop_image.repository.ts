import { query } from '../../database/query.js';
import { DropImage } from './drop_image.model.js';
import { CreateDropImageInput } from './store_image.schema.js';

class DropImageRepository {
  async createDropImage(input: CreateDropImageInput & { image_id: string }) {
    const result = await query<DropImage>(
      `INSERT INTO listing_images (image_id, listing_id, url, sort_order) VALUES ($1, $2, $3, $4)`,
      [input.image_id, input.listing_id, input.url, input.sort_order],
    );
    return result;
  }
}

export const dropImageRepository = new DropImageRepository();
