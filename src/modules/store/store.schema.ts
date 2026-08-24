import z from "zod";

export const createStoreSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  slug: z.string().min(1, "Store slug is required").regex(/^[a-z0-9_]+$/, "Slug must be lowercase and can contain underscores"),
  avatar: z.url("Avatar must be a valid URL").nullable().optional(),
  cover: z.url("Cover must be a valid URL").nullable().optional(),
  description: z.string().max(500, "Description cannot exceed 500 characters").nullable().optional()
})

export const updateStoreSchema = z.object({
    name: z.string().min(1, "Store name is required").optional(),
    slug: z.string().min(1, "Store slug is required").regex(/^[a-z0-9_]+$/, "Slug must be lowercase and can contain underscores").optional(),
    avatar: z.url("Avatar must be a valid URL").nullable().optional(),
    cover: z.url("Cover must be a valid URL").nullable().optional(),
    description: z.string().max(500, "Description cannot exceed 500 characters").nullable().optional()
})

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;