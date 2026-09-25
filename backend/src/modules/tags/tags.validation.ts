import { z } from "zod";

export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(100),

  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Invalid slug format"
    ),
});

export const updateTagSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(100)
    .optional(),

  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Invalid slug format"
    )
    .optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;