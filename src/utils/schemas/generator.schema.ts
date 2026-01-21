import { z } from "zod/v4";
import { operationSchema } from "./operation.schema.js";
import { promptSchema } from "./prompt.schema.js";

/**
 * Generator ID schema
 */
export const generatorIdSchema = z.string().min(1, "cannot be empty");

/**
 * Generator configuration schema
 */
export const generatorSchema = z.object({
	description: z.string().min(1, "cannot be empty"),
	prompts: z.array(promptSchema).optional(),
	operations: z.array(operationSchema).min(1, "cannot be empty"),
});

export type GeneratorConfig = z.infer<typeof generatorSchema>;
