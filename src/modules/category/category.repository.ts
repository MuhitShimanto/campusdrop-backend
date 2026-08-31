import { query } from '../../database/query.js';

class CategoryRepository {
  async getAll() {
    const result = await query(
      `
            SELECT category_id, name, slug FROM categories
        `,
      [],
    );
    return result.rows;
  }
}

export const categoryRepository = new CategoryRepository();
