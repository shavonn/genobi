import { z } from "zod/v4";

/**
 * Valid Inquirer.js prompt types
 */
const simplePromptTypes = ["input", "number", "confirm", "password", "editor"] as const;
const listPromptTypes = ["list", "rawlist", "expand", "checkbox"] as const;

/**
 * Base prompt fields shared by all prompt types
 */
const basePromptFields = {
  name: z.string().min(1, "cannot be empty"),
  message: z.string().min(1, "cannot be empty").optional(),
};

/**
 * Schema for simple prompt types (no choices required)
 */
const simplePromptSchema = z.object({
  ...basePromptFields,
  type: z.enum(simplePromptTypes),
});

/**
 * Schema for list-based prompt types (choices required)
 */
const listPromptSchema = z.object({
  ...basePromptFields,
  type: z.enum(listPromptTypes),
  choices: z.array(z.unknown()).min(1, "cannot be empty"),
});

/**
 * Combined prompt schema using discriminated union
 */
export const promptSchema = z.discriminatedUnion("type", [simplePromptSchema, listPromptSchema]);

export type PromptConfig = z.infer<typeof promptSchema>;
