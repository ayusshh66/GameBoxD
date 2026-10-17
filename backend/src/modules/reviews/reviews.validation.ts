import { z } from "zod";

export const gameIdSchema = z.string().uuid();
export const reviewIdSchema = z.string().uuid();

export const ratingSchema = z.object({
  rating: z
    .number()
    .min(1)
    .max(5)
    .refine((value) => Number.isInteger(value * 2), {
      message: "Rating must be in increments of 0.5",
    }),
});

export const createReviewSchema = z.object({
  content: z.string().trim().min(1).max(5000),
  isSpoiler: z.boolean().default(false),
});

export const updateReviewSchema = z
  .object({
    content: z.string().trim().min(1).max(5000).optional(),
    isSpoiler: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.content !== undefined ||
      data.isSpoiler !== undefined,
    { message: "Provide at least one field to update" }
  );

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});