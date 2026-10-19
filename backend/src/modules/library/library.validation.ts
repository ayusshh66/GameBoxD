
import { z } from "zod";

export const libraryGameIdSchema = z.string().uuid();

export const libraryPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
