
import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(1)
  .max(30);

export const followPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
