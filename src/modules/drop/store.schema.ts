import z from "zod";

// General Drop Schema
export const createDropSchema = z.object({
  category_id: z.string("Category ID must be a valid UUID"),
  listing_type: z.enum(["always_on", "preorder"]),
  name: z.string().min(1, "Drop name is required"),
  description: z.string().max(500, "Description cannot exceed 500 characters").nullable().optional(),
  price: z.number().positive("Price must be a positive number").optional(),
  status: z.enum(["draft", "active", "paused", "sold_out", "archived"]).default("draft"),
  fulfillment_mode: z.enum(["immediate", "scheduled"]).default("immediate"),
  pickup_location: z.string().min(1, "Pickup location is required"),
  pickup_starts_at: z.string().optional(),
  pickup_ends_at: z.string().optional()
})
export const updateDropSchema = z.object({
  category_id: z.string("Category ID must be a valid UUID").optional(),
  name: z.string().min(1, "Drop name is required").optional(),
  description: z.string().max(500, "Description cannot exceed 500 characters").nullable().optional(),
  price: z.number().positive("Price must be a positive number").optional(),
  status: z.enum(["draft", "active", "paused", "sold_out", "archived"]).optional(),
  fulfillment_mode: z.enum(["immediate", "scheduled"]).optional(),
  pickup_location: z.string().min(1, "Pickup location is required").optional(),
  pickup_starts_at: z.string().optional(),
  pickup_ends_at: z.string().optional(),
})



// PreOrder and AlwaysOn Drop Schemas
export const createPreOrderSchema = z.object({
  ...createDropSchema.shape,
  order_start_time: z.string().min(1, "Order start time is required"),
  order_end_time: z.string().min(1, "Order end time is required")
})
export const createAlwaysOnSchema = z.object({
  ...createDropSchema.shape,
  estimated_delivery_days: z.number().int().positive("Estimated delivery day must be a positive integer")
})
export const updatePreOrderSchema = z.object({
  ...updateDropSchema.shape,
  order_start_time: z.string().min(1, "Order start time is required").optional(),
  order_end_time: z.string().min(1, "Order end time is required").optional()
})
export const updateAlwaysOnSchema = z.object({
  ...updateDropSchema.shape,
  estimated_delivery_days: z.number().int().positive("Estimated delivery day must be a positive integer").optional()
})

export type CreateDropInput = z.infer<typeof createDropSchema>;
export type UpdateDropInput = z.infer<typeof updateDropSchema>;
export type CreatePreOrderInput = z.infer<typeof createPreOrderSchema>;
export type CreateAlwaysOnInput = z.infer<typeof createAlwaysOnSchema>;
export type UpdatePreOrderInput = z.infer<typeof updatePreOrderSchema>;
export type UpdateAlwaysOnInput = z.infer<typeof updateAlwaysOnSchema>;