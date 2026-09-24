import { z } from "zod";

export const createGenreSchema = z.object({
  name: z
    .string()
    .min(1, "Genre name is required")
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

export const updateGenreSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .optional(),

  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Invalid slug format"
    )
    .optional(),
});

export type CreateGenreInput = z.infer<typeof createGenreSchema>;
export type UpdateGenreInput = z.infer<typeof updateGenreSchema>;