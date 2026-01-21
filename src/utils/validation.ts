import {ValidationError} from "../errors.js";
import {logger} from "./logger.js";
import {expectedPartialFileTypes} from "./resources/expected-partial-file-types.js";
import {
	helperFunctionSchema,
	helperNameSchema,
	partialFilePathSchema,
	partialNameSchema,
	partialSchema,
	reservedOperationTypes,
	validOperationTypes,
} from "./schemas";

/**
 * Handles special validation cases that need custom error messages
 */
function validatePromptWithCustomErrors(prompt: unknown, index: number): void {
	if (typeof prompt !== "object" || prompt === null) {
		throw new ValidationError(`prompts[${index}]`, "must be an object");
	}

	const p = prompt as Record<string, unknown>;

	// Check for missing required fields with custom messages
	if (!("type" in p) || p.type === undefined) {
		throw new ValidationError(`prompts[${index}].type`, "is required");
	}

	if (!("name" in p) || p.name === undefined) {
		throw new ValidationError(`prompts[${index}].name`, "is required");
	}

	// Validate type is string and is a valid type
	if (typeof p.type !== "string") {
		throw new ValidationError(`prompts[${index}].type`, "must be a string");
	}

	const validTypes = ["input", "number", "confirm", "list", "rawlist", "expand", "checkbox", "password", "editor"];
	if (!validTypes.includes(p.type)) {
		throw new ValidationError(`prompts[${index}].type`, `must be one of: ${validTypes.join(", ")}`);
	}

	// Validate name
	if (typeof p.name !== "string") {
		throw new ValidationError(`prompts[${index}].name`, "must be a string");
	}
	if (p.name.trim().length === 0) {
		throw new ValidationError(`prompts[${index}].name`, "cannot be empty");
	}

	// Validate message if present
	if (p.message !== undefined) {
		if (typeof p.message !== "string") {
			throw new ValidationError(`prompts[${index}].message`, "must be a string");
		}
		if (p.message.trim().length === 0) {
			throw new ValidationError(`prompts[${index}].message`, "cannot be empty");
		}
	}

	// Validate choices for list-based types
	const listTypes = ["list", "rawlist", "expand", "checkbox"];
	if (listTypes.includes(p.type)) {
		if (!("choices" in p) || p.choices === undefined) {
			throw new ValidationError(`prompts[${index}].choices`, `is required for type "${p.type}"`);
		}
		if (!Array.isArray(p.choices)) {
			throw new ValidationError(`prompts[${index}].choices`, "must be an array");
		}
		if (p.choices.length === 0) {
			throw new ValidationError(`prompts[${index}].choices`, "cannot be empty");
		}
	}
}

/**
 * Validates an operation with custom error messages
 */
function validateOperationWithCustomErrors(operation: unknown, index: number): void {
	const opField = `operations[${index}]`;

	if (typeof operation !== "object" || operation === null) {
		throw new ValidationError(opField, "must be an object");
	}

	const op = operation as Record<string, unknown>;

	// Validate type
	if (!("type" in op) || op.type === undefined) {
		throw new ValidationError(`${opField}.type`, "is required");
	}

	if (typeof op.type !== "string") {
		throw new ValidationError(`${opField}.type`, "must be a string");
	}

	if (!validOperationTypes.includes(op.type as typeof validOperationTypes[number])) {
		throw new ValidationError(`${opField}.type`, `must be one of: ${validOperationTypes.join(", ")}`);
	}

	// Validate optional base fields
	if (op.data !== undefined) {
		if (typeof op.data !== "object" || op.data === null || Array.isArray(op.data)) {
			throw new ValidationError(`${opField}.data`, "must be an object");
		}
	}

	if (op.skip !== undefined) {
		if (typeof op.skip !== "function") {
			throw new ValidationError(`${opField}.skip`, "must be a function");
		}
	}

	if (op.haltOnError !== undefined) {
		if (typeof op.haltOnError !== "boolean") {
			throw new ValidationError(`${opField}.haltOnError`, "must be a boolean");
		}
	}

	// Type-specific validation
	switch (op.type) {
		case "create":
			validateCreateOperation(op, index);
			break;
		case "append":
		case "prepend":
			validateAmendOperation(op, index);
			break;
		case "createAll":
			validateCreateAllOperation(op, index);
			break;
		case "forMany":
			validateForManyOperation(op, index);
			break;
		case "custom":
			validateCustomOperation(op, index);
			break;
	}
}

/**
 * Validates a custom operation (inline action)
 */
function validateCustomOperation(op: Record<string, unknown>, index: number): void {
	const opField = `operations[${index}]`;

	// Validate name
	if (!("name" in op) || op.name === undefined) {
		throw new ValidationError(`${opField}.name`, "is required");
	}
	if (typeof op.name !== "string") {
		throw new ValidationError(`${opField}.name`, "must be a string");
	}
	if (op.name.trim().length === 0) {
		throw new ValidationError(`${opField}.name`, "cannot be empty");
	}

	// Validate action
	if (!("action" in op) || op.action === undefined) {
		throw new ValidationError(`${opField}.action`, "is required");
	}
	if (typeof op.action !== "function") {
		throw new ValidationError(`${opField}.action`, "must be a function");
	}
}

/**
 * Validates single file operation fields (create, append, prepend)
 */
function validateSingleFileOperation(op: Record<string, unknown>, index: number): void {
	const opField = `operations[${index}]`;

	// Validate filePath
	if (!("filePath" in op) || op.filePath === undefined) {
		throw new ValidationError(`${opField}.filePath`, "is required");
	}
	if (typeof op.filePath !== "string") {
		throw new ValidationError(`${opField}.filePath`, "must be a string");
	}
	if (op.filePath.trim().length === 0) {
		throw new ValidationError(`${opField}.filePath`, "cannot be empty");
	}

	// Validate template source
	const hasTemplateStr = "templateStr" in op && op.templateStr !== undefined;
	const hasTemplateFilePath = "templateFilePath" in op && op.templateFilePath !== undefined;

	if (!hasTemplateStr && !hasTemplateFilePath) {
		throw new ValidationError(opField, "must have either templateStr or templateFilePath");
	}

	if (hasTemplateStr && hasTemplateFilePath) {
		throw new ValidationError(opField, "cannot have both templateStr and templateFilePath");
	}

	if (hasTemplateStr && typeof op.templateStr !== "string") {
		throw new ValidationError(`${opField}.templateStr`, "must be a string");
	}

	if (hasTemplateFilePath) {
		if (typeof op.templateFilePath !== "string") {
			throw new ValidationError(`${opField}.templateFilePath`, "must be a string");
		}
		if ((op.templateFilePath as string).trim().length === 0) {
			throw new ValidationError(`${opField}.templateFilePath`, "cannot be empty");
		}
	}
}

/**
 * Validates create operation
 */
function validateCreateOperation(op: Record<string, unknown>, index: number): void {
	const opField = `operations[${index}]`;

	validateSingleFileOperation(op, index);

	// Validate optional fields
	if (op.skipIfExists !== undefined && typeof op.skipIfExists !== "boolean") {
		throw new ValidationError(`${opField}.skipIfExists`, "must be a boolean");
	}

	if (op.overwrite !== undefined && typeof op.overwrite !== "boolean") {
		throw new ValidationError(`${opField}.overwrite`, "must be a boolean");
	}

	// Check for conflicting options
	if (op.skipIfExists === true && op.overwrite === true) {
		throw new ValidationError(opField, "cannot have both skipIfExists and overwrite set to true");
	}
}

/**
 * Validates amend operation (append/prepend)
 */
function validateAmendOperation(op: Record<string, unknown>, index: number): void {
	const opField = `operations[${index}]`;

	validateSingleFileOperation(op, index);

	// Validate optional fields
	if (op.separator !== undefined && typeof op.separator !== "string") {
		throw new ValidationError(`${opField}.separator`, "must be a string");
	}

	if (op.unique !== undefined && typeof op.unique !== "boolean") {
		throw new ValidationError(`${opField}.unique`, "must be a boolean");
	}

	if (op.pattern !== undefined) {
		if (typeof op.pattern !== "string" && !(op.pattern instanceof RegExp)) {
			throw new ValidationError(`${opField}.pattern`, "must be a string or RegExp");
		}
	}
}

/**
 * Validates createAll operation
 */
function validateCreateAllOperation(op: Record<string, unknown>, index: number): void {
	const opField = `operations[${index}]`;

	// Validate required fields
	if (!("destinationPath" in op) || op.destinationPath === undefined) {
		throw new ValidationError(`${opField}.destinationPath`, "is required");
	}
	if (typeof op.destinationPath !== "string") {
		throw new ValidationError(`${opField}.destinationPath`, "must be a string");
	}
	if ((op.destinationPath as string).trim().length === 0) {
		throw new ValidationError(`${opField}.destinationPath`, "cannot be empty");
	}

	if (!("templateFilesGlob" in op) || op.templateFilesGlob === undefined) {
		throw new ValidationError(`${opField}.templateFilesGlob`, "is required");
	}
	if (typeof op.templateFilesGlob !== "string") {
		throw new ValidationError(`${opField}.templateFilesGlob`, "must be a string");
	}
	if ((op.templateFilesGlob as string).trim().length === 0) {
		throw new ValidationError(`${opField}.templateFilesGlob`, "cannot be empty");
	}

	// Validate optional fields
	if (op.templateBasePath !== undefined) {
		if (typeof op.templateBasePath !== "string") {
			throw new ValidationError(`${opField}.templateBasePath`, "must be a string");
		}
		if ((op.templateBasePath as string).trim().length === 0) {
			throw new ValidationError(`${opField}.templateBasePath`, "cannot be empty");
		}
	}

	if (op.verbose !== undefined && typeof op.verbose !== "boolean") {
		throw new ValidationError(`${opField}.verbose`, "must be a boolean");
	}

	if (op.skipIfExists !== undefined && typeof op.skipIfExists !== "boolean") {
		throw new ValidationError(`${opField}.skipIfExists`, "must be a boolean");
	}

	if (op.overwrite !== undefined && typeof op.overwrite !== "boolean") {
		throw new ValidationError(`${opField}.overwrite`, "must be a boolean");
	}

	// Check for conflicting options
	if (op.skipIfExists === true && op.overwrite === true) {
		throw new ValidationError(opField, "cannot have both skipIfExists and overwrite set to true");
	}
}

/**
 * Validates forMany operation
 */
function validateForManyOperation(op: Record<string, unknown>, index: number): void {
	const opField = `operations[${index}]`;

	// Validate required fields
	if (!("generatorId" in op) || op.generatorId === undefined) {
		throw new ValidationError(`${opField}.generatorId`, "is required");
	}
	if (typeof op.generatorId !== "string") {
		throw new ValidationError(`${opField}.generatorId`, "must be a string");
	}
	if ((op.generatorId as string).trim().length === 0) {
		throw new ValidationError(`${opField}.generatorId`, "cannot be empty");
	}

	if (!("items" in op) || op.items === undefined) {
		throw new ValidationError(`${opField}.items`, "is required");
	}

	// Validate items - can be array or function
	if (!Array.isArray(op.items) && typeof op.items !== "function") {
		throw new ValidationError(`${opField}.items`, "must be an array or function");
	}

	if (Array.isArray(op.items) && op.items.length === 0) {
		throw new ValidationError(`${opField}.items`, "array cannot be empty");
	}

	// Validate optional transformItem
	if (op.transformItem !== undefined && typeof op.transformItem !== "function") {
		throw new ValidationError(`${opField}.transformItem`, "must be a function");
	}
}

/**
 * Validates a generator configuration
 */
export function validateGenerator(id: string, generator: unknown): void {
	logger.info(`Validating generator: ${id}`);

	try {
		// Validate id - must be non-empty after trimming
		if (id.trim().length === 0) {
			throw new ValidationError("generator id", "cannot be empty");
		}

		// Validate generator is an object
		if (typeof generator !== "object" || generator === null) {
			throw new ValidationError("generator", "must be an object");
		}

		const gen = generator as Record<string, unknown>;

		// Validate description
		if (!("description" in gen) || gen.description === undefined) {
			throw new ValidationError("generator.description", "is required");
		}
		if (typeof gen.description !== "string") {
			throw new ValidationError("generator.description", "must be a string");
		}
		if ((gen.description as string).trim().length === 0) {
			throw new ValidationError("generator.description", "cannot be empty");
		}

		// Validate prompts if present
		if (gen.prompts !== undefined) {
			if (!Array.isArray(gen.prompts)) {
				throw new ValidationError("generator.prompts", "must be an array");
			}
			for (let i = 0; i < gen.prompts.length; i++) {
				validatePromptWithCustomErrors(gen.prompts[i], i);
			}
		}

		// Validate operations
		if (!("operations" in gen) || gen.operations === undefined) {
			throw new ValidationError("generator.operations", "is required");
		}
		if (!Array.isArray(gen.operations)) {
			throw new ValidationError("generator.operations", "must be an array");
		}
		if (gen.operations.length === 0) {
			throw new ValidationError("generator.operations", "cannot be empty");
		}

		// Validate each operation
		for (let i = 0; i < gen.operations.length; i++) {
			validateOperationWithCustomErrors(gen.operations[i], i);
		}

		// Cross-validate forMany operations reference existing generators
		for (let i = 0; i < gen.operations.length; i++) {
			const op = gen.operations[i];
			if (typeof op === "object" && op !== null && (op as Record<string, unknown>).type === "forMany") {
				const forManyOp = op as Record<string, unknown>;
				if (forManyOp.generatorId === id) {
					logger.warn(`Warning: operations[${i}] references itself (${id}), this could cause infinite recursion`);
				}
			}
		}
	} catch (err) {
		if (err instanceof ValidationError) {
			logger.error(`Generator "${id}" validation failed`);
			throw err;
		}
		throw err;
	}
}

/**
 * Validates a helper function
 */
export function validateHelper(name: string, helper: unknown): void {
	logger.info(`Validating helper: ${name}`);

	try {
		// Validate name using Zod
		const nameResult = helperNameSchema.safeParse(name);
		if (!nameResult.success) {
			const issue = nameResult.error.issues[0];
			if (issue && issue.code === "too_small") {
				throw new ValidationError("helper name", "cannot be empty");
			}
			if (issue && issue.code === "custom") {
				// Reserved name check
				throw new ValidationError("helper name", `"${name}" is a reserved Handlebars helper name`);
			}
			throw new ValidationError("helper name", issue?.message || "is invalid");
		}

		// Validate helper is a function using Zod
		const helperResult = helperFunctionSchema.safeParse(helper);
		if (!helperResult.success) {
			throw new ValidationError("helper function", "must be a function");
		}
	} catch (err) {
		if (err instanceof ValidationError) {
			logger.error(`Helper "${name}" validation failed`);
			throw err;
		}
		throw err;
	}
}

/**
 * Validates a partial template
 */
export function validatePartial(name: string, partial: unknown): void {
	logger.info(`Validating partial: ${name}`);

	try {
		// Validate name
		const nameResult = partialNameSchema.safeParse(name);
		if (!nameResult.success) {
			throw new ValidationError("partial name", "cannot be empty");
		}

		// Validate partial content
		const partialResult = partialSchema.safeParse(partial);
		if (!partialResult.success) {
			throw new ValidationError("partial", "must be a string or template function");
		}
	} catch (err) {
		if (err instanceof ValidationError) {
			logger.error(`Partial "${name}" validation failed`);
			throw err;
		}
		throw err;
	}
}

/**
 * Validates a partial file path
 */
export function validatePartialFilePath(name: string, filePath: string): void {
	logger.info(`Validating partial file: ${name} -> ${filePath}`);

	try {
		// Validate name
		const nameResult = partialNameSchema.safeParse(name);
		if (!nameResult.success) {
			throw new ValidationError("partial name", "cannot be empty");
		}

		// Validate file path
		const filePathResult = partialFilePathSchema.safeParse(filePath);
		if (!filePathResult.success) {
			throw new ValidationError("partial file path", "cannot be empty");
		}

		// Check for common file extensions (warning only)
		const hasValidExtension = expectedPartialFileTypes.some((ext) => filePath.toLowerCase().endsWith(ext));

		if (!hasValidExtension) {
			logger.warn(
				`Warning: Partial file "${filePath}" doesn't have a common template extension (${expectedPartialFileTypes.join(", ")})`,
			);
		}
	} catch (err) {
		if (err instanceof ValidationError) {
			logger.error(`Partial file "${name}" validation failed`);
			throw err;
		}
		throw err;
	}
}

/**
 * Validates a custom operation registration (addOperation API)
 */
export function validateOperationRegistration(name: string, handler: unknown): void {
	logger.info(`Validating operation registration: ${name}`);

	try {
		// Validate name
		if (name.trim().length === 0) {
			throw new ValidationError("operation name", "cannot be empty");
		}

		// Check against reserved/built-in types
		if (reservedOperationTypes.includes(name as (typeof reservedOperationTypes)[number])) {
			throw new ValidationError("operation name", `"${name}" is a reserved operation type`);
		}

		// Validate handler is a function
		if (typeof handler !== "function") {
			throw new ValidationError("operation handler", "must be a function");
		}
	} catch (err) {
		if (err instanceof ValidationError) {
			logger.error(`Operation "${name}" registration validation failed`);
			throw err;
		}
		throw err;
	}
}

/**
 * Validation utilities
 */
export const validation = {
	validateGenerator,
	validateHelper,
	validatePartial,
	validatePartialFilePath,
	validateOperationRegistration,
};
