import { z } from "zod";

export const createPlatformSchema = z.object({
  name: z
    .string()
    .min(1, "Platform name is required")
    .max(100),

  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Invalid slug format"
    ),

  logoUrl: z
    .string()
    .url("Invalid logo URL")
    .optional()
    .nullable(),
});

export const updatePlatformSchema = z.object({
  name: z
    .string()
    .min(1, "Platform name is required")
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

  logoUrl: z
    .string()
    .url("Invalid logo URL")
    .optional()
    .nullable(),
});

export type CreatePlatformInput = z.infer<
  typeof createPlatformSchema
>;

export type UpdatePlatformInput = z.infer<
  typeof updatePlatformSchema
>;