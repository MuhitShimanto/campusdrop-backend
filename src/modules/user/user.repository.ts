import { query } from '../../database/query.js';
import { User } from './user.model.js';
import { UpdateSelfUserInput, UpdateUserByAdminInput } from './user.schema.js';

const columnMap = {
  name: 'name',
  sid: 'sid',
  avatar: 'avatar',
  slug: 'slug',
  universityEmail: 'university_email',
  accountStatus: 'account_status',
  role: 'role',
  isVerified: 'is_verified',
} as const;

class UserRepository {
  async update(
    userId: string,
    userData: UpdateSelfUserInput | UpdateUserByAdminInput,
  ): Promise<User | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(userData)) {
      if (value === undefined || !(key in columnMap)) {
        continue;
      }

      const column = columnMap[key as keyof typeof columnMap];

      fields.push(`${column} = $${values.length + 1}`);
      values.push(value);
    }

    if (fields.length === 0) {
      return null;
    }

    values.push(userId);

    const result = await query<User>(
      `UPDATE users
       SET ${fields.join(', ')}
       WHERE user_id = $${values.length}
       RETURNING *`,
      values,
    );

    return result.rows[0] ?? null;
  }
}

export const userRepository = new UserRepository();
