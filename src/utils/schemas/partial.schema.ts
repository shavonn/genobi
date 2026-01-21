import { z } from "zod/v4";

/**
 * Partial name schema
 */
export const partialNameSchema = z.string().min(1, "cannot be empty");

/**
 * Partial content schema - can be a string template or a compiled template function
 */
export const partialSchema = z.union([z.string(), z.function()]);

/**
 * Partial file path schema
 */
export const partialFilePathSchema = z.string().min(1, "cannot be empty");

export type PartialName = z.infer<typeof partialNameSchema>;
export type PartialContent = z.infer<typeof partialSchema>;
