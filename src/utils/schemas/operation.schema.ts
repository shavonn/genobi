import { z } from "zod/v4";

/**
 * Base fields shared by all operation types
 */
const baseOperationFields = {
	data: z.record(z.string(), z.unknown()).optional(),
	skip: z.function().optional(),
	haltOnError: z.boolean().optional(),
};

/**
 * Template source fields with mutual exclusivity constraint
 * Must have either templateStr OR templateFilePath, but not both
 */
const templateSourceFields = {
	templateStr: z.string().optional(),
	templateFilePath: z.string().min(1, "cannot be empty").optional(),
};

/**
 * Skip/overwrite fields with mutual exclusivity constraint
 */
const skipOverwriteFields = {
	skipIfExists: z.boolean().optional(),
	overwrite: z.boolean().optional(),
};

/**
 * Create operation schema
 */
const createOperationSchema = z
	.object({
		...baseOperationFields,
		...templateSourceFields,
		...skipOverwriteFields,
		type: z.literal("create"),
		filePath: z.string().min(1, "cannot be empty"),
	})
	.refine((data) => Boolean(data.templateStr !== undefined) !== Boolean(data.templateFilePath !== undefined), {
		message: "must have either templateStr or templateFilePath",
	})
	.refine((data) => !(data.skipIfExists && data.overwrite), {
		message: "cannot have both skipIfExists and overwrite set to true",
	});

/**
 * Append operation schema
 */
const appendOperationSchema = z
	.object({
		...baseOperationFields,
		...templateSourceFields,
		type: z.literal("append"),
		filePath: z.string().min(1, "cannot be empty"),
		separator: z.string().optional(),
		unique: z.boolean().optional(),
		pattern: z.union([z.string(), z.instanceof(RegExp)]).optional(),
	})
	.refine((data) => Boolean(data.templateStr !== undefined) !== Boolean(data.templateFilePath !== undefined), {
		message: "must have either templateStr or templateFilePath",
	});

/**
 * Prepend operation schema
 */
const prependOperationSchema = z
	.object({
		...baseOperationFields,
		...templateSourceFields,
		type: z.literal("prepend"),
		filePath: z.string().min(1, "cannot be empty"),
		separator: z.string().optional(),
		unique: z.boolean().optional(),
		pattern: z.union([z.string(), z.instanceof(RegExp)]).optional(),
	})
	.refine((data) => Boolean(data.templateStr !== undefined) !== Boolean(data.templateFilePath !== undefined), {
		message: "must have either templateStr or templateFilePath",
	});

/**
 * CreateAll operation schema
 */
const createAllOperationSchema = z
	.object({
		...baseOperationFields,
		...skipOverwriteFields,
		type: z.literal("createAll"),
		destinationPath: z.string().min(1, "cannot be empty"),
		templateFilesGlob: z.string().min(1, "cannot be empty"),
		templateBasePath: z.string().min(1, "cannot be empty").optional(),
		verbose: z.boolean().optional(),
	})
	.refine((data) => !(data.skipIfExists && data.overwrite), {
		message: "cannot have both skipIfExists and overwrite set to true",
	});

/**
 * ForMany operation schema
 */
const forManyOperationSchema = z
	.object({
		...baseOperationFields,
		type: z.literal("forMany"),
		generatorId: z.string().min(1, "cannot be empty"),
		items: z.union([z.array(z.unknown()), z.function()]),
		transformItem: z.function().optional(),
	})
	.refine(
		(data) => {
			if (Array.isArray(data.items)) {
				return data.items.length > 0;
			}
			return true;
		},
		{
			message: "array cannot be empty",
			path: ["items"],
		},
	);

/**
 * Combined operation schema using union
 * Note: Using z.union instead of discriminatedUnion because refinements
 * are applied after the discriminated union check
 */
export const operationSchema = z.union([
	createOperationSchema,
	appendOperationSchema,
	prependOperationSchema,
	createAllOperationSchema,
	forManyOperationSchema,
]);

/**
 * Valid built-in operation types for external reference.
 * Note: Custom registered operations are not included here as they are validated at runtime.
 */
export const validOperationTypes = ["create", "createAll", "append", "prepend", "forMany", "custom"] as const;

/**
 * Reserved operation type names that cannot be used for registered operations.
 */
export const reservedOperationTypes = ["create", "createAll", "append", "prepend", "forMany", "custom"] as const;

export type OperationConfig = z.infer<typeof operationSchema>;
