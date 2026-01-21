import { z } from "zod/v4";

/**
 * Reserved Handlebars helper names that cannot be overwritten
 */
const reservedHelperNames = ["if", "unless", "each", "with", "lookup", "log"] as const;

/**
 * Helper name schema - validates the name is non-empty and not reserved
 */
export const helperNameSchema = z
  .string()
  .min(1, "cannot be empty")
  .refine((name) => !reservedHelperNames.includes(name as (typeof reservedHelperNames)[number]), {
    message: "is a reserved Handlebars helper name",
  });

/**
 * Helper function schema
 */
export const helperFunctionSchema = z.function();

export type HelperName = z.infer<typeof helperNameSchema>;
