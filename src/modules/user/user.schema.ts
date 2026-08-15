import { z } from 'zod';
import { AccountStatus, UserRole } from './user.types.js';

export const createUserSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),

  sid: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  universityEmail: z.email().nullable().optional(),

  accountStatus: z.enum(AccountStatus).optional(),

  role: z.enum(UserRole).optional(),

  isVerified: z.boolean().optional(),
});

export const updateSelfUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  sid: z.string().nullable().optional(),
  avatar: z.url().nullable().optional(),
  slug: z.string().nullable().optional(),
});

export const updateUserByAdminSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  sid: z.string().nullable().optional(),
  avatar: z.url().nullable().optional(),
  universityEmail: z.email().nullable().optional(),

  accountStatus: z.enum(AccountStatus).optional(),
  role: z.enum(UserRole).optional(),
  isVerified: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateSelfUserInput = z.infer<typeof updateSelfUserSchema>;

export type UpdateUserByAdminInput = z.infer<typeof updateUserByAdminSchema>;
