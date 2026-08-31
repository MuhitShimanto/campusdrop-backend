import z from "zod";

export const createDropImageSchema = z.object({
  listing_id: z.string("Listing ID must be a valid UUID"),
  url: z.string("URL must be a valid URL"),
  sort_order: z.number().int().nonnegative("Sort order must be a non-negative integer"),
})
export const updateDropImageSchema = z.object({
  listing_id: z.string("Listing ID must be a valid UUID").optional(),
  sort_order: z.number().int().nonnegative("Sort order must be a non-negative integer").optional(),
})

export type CreateDropImageInput = z.infer<typeof createDropImageSchema>;
export type UpdateDropImageInput = z.infer<typeof updateDropImageSchema>;