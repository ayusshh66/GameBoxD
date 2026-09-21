import { z } from "zod";

export const createGameSchema = z.object({
  name: z.string().min(1).max(255),

  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Invalid slug format"
    ),

  description: z.string().optional(),

  coverUrl: z.string().url().optional(),

  backgroundUrl: z.string().url().optional(),

  releaseDate: z.coerce.date().optional(),

  status: z.enum(["upcoming", "released", "cancelled"]),

  metacriticScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .optional(),

  tagIds: z.array(z.string().uuid()).default([]),

  genreIds: z.array(z.string().uuid()).default([]),

  platformIds: z.array(z.string().uuid()).default([]),
});

export const updateGameSchema = createGameSchema.partial();