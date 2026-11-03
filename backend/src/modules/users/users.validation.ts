
import { z } from "zod";

export const updateProfileSchema = z
  .object({
    displayName: z.string().trim().min(1).max(100)
      .nullable().optional(),

    bio: z.string().trim().max(500)
      .nullable().optional(),

    avatarUrl: z.url().max(2048)
      .refine(
        (url) => url.startsWith("https://"),
        "Avatar URL must use HTTPS"
      )
      .nullable().optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required"
  );

export type UpdateProfileInput =
  z.infer<typeof updateProfileSchema>;
