import { ValidationError } from "../errors";
import { logger } from "./logger";
import { expectedPartialFileTypes } from "./resources/expected-partial-file-types";

/**
 * Validates that a value is a non-empty string
 */
function validateNonEmptyString(value: any, fieldName: string): void {
	if (typeof value !== "string") {
		throw new ValidationError(fieldName, "must be a string");
	}
	if (value.trim().length === 0) {
		throw new ValidationError(fieldName, "cannot be empty");
	}
}

/**
 * Validates that a value is a valid function
 */
function validateFunction(value: any, fieldName: string): void {
	if (typeof value !== "function") {
		throw new ValidationError(fieldName, "must be a function");
	}
}

/**
 * Validates that a value is an array
 */
function validateArray(value: any, fieldName: string): void {
	if (!Array.isArray(value)) {
		throw new ValidationError(fieldName, "must be an array");
	}
}

/**
 * Validates that a value is a boolean
 */
function validateBoolean(value: any, fieldName: string): void {
	if (typeof value !== "boolean") {
		throw new ValidationError(fieldName, "must be a boolean");
	}
}

/**
 * Validates that a value is an object (and not null or array)
 */
function validateObject(value: any, fieldName: string): void {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		throw new ValidationError(fieldName, "must be an object");
	}
}

/**
 * Validates a single prompt configuration
 */
function validatePrompt(prompt: any, index: number): void {
	const promptField = `prompts[${index}]`;

	if (!prompt || typeof prompt !== "object") {
		throw new ValidationError(promptField, "must be an object");
	}

	// Validate required fields
	if (!prompt.type) {
		throw new ValidationError(`${promptField}.type`, "is required");
	}

	if (!prompt.name) {
		throw new ValidationError(`${promptField}.name`, "is required");
	}

	validateNonEmptyString(prompt.type, `${promptField}.type`);
	validateNonEmptyString(prompt.name, `${promptField}.name`);

	// Validate type is a known Inquirer type
	const validTypes = ["input", "number", "confirm", "list", "rawlist", "expand", "checkbox", "password", "editor"];
	if (!validTypes.includes(prompt.type)) {
		throw new ValidationError(`${promptField}.type`, `must be one of: ${validTypes.join(", ")}`);
	}

	// Validate message if present
	if (prompt.message !== undefined) {
		validateNonEmptyString(prompt.message, `${promptField}.message`);
	}

	// Validate choices for list-based types
	if (["list", "rawlist", "expand", "checkbox"].includes(prompt.type)) {
		if (!prompt.choices) {
			throw new ValidationError(`${promptField}.choices`, `is required for type "${prompt.type}"`);
		}
		validateArray(prompt.choices, `${promptField}.choices`);
		if (prompt.choices.length === 0) {
			throw new ValidationError(`${promptField}.choices`, "cannot be empty");
		}
	}
}

/**
 * Validates a base operation
 */
function validateBaseOperation(operation: any, index: number): void {
	const opField = `operations[${index}]`;

	if (!operation || typeof operation !== "object") {
		throw new ValidationError(opField, "must be an object");
	}

	// Validate type
	if (!operation.type) {
		throw new ValidationError(`${opField}.type`, "is required");
	}

	const validTypes = ["create", "createAll", "append", "prepend", "forMany"];
	if (!validTypes.includes(operation.type)) {
		throw new ValidationError(`${opField}.type`, `must be one of: ${validTypes.join(", ")}`);
	}

	// Validate optional fields
	if (operation.data !== undefined) {
		validateObject(operation.data, `${opField}.data`);
	}

	if (operation.skip !== undefined) {
		validateFunction(operation.skip, `${opField}.skip`);
	}

	if (operation.haltOnError !== undefined) {
		validateBoolean(operation.haltOnError, `${opField}.haltOnError`);
	}
}

/**
 * Validates a single file operation (create, append, prepend)
 */
function validateSingleFileOperation(operation: any, index: number): void {
	const opField = `operations[${index}]`;

	// Validate filePath
	if (!operation.filePath) {
		throw new ValidationError(`${opField}.filePath`, "is required");
	}
	validateNonEmptyString(operation.filePath, `${opField}.filePath`);

	// Validate template source - must have either templateStr or templateFilePath
	if (!operation.templateStr && !operation.templateFilePath) {
		throw new ValidationError(opField, "must have either templateStr or templateFilePath");
	}

	if (operation.templateStr && operation.templateFilePath) {
		throw new ValidationError(opField, "cannot have both templateStr and templateFilePath");
	}

	if (operation.templateStr !== undefined) {
		if (typeof operation.templateStr !== "string") {
			throw new ValidationError(`${opField}.templateStr`, "must be a string");
		}
	}

	if (operation.templateFilePath !== undefined) {
		validateNonEmptyString(operation.templateFilePath, `${opField}.templateFilePath`);
	}
}

/**
 * Validates a create operation
 */
function validateCreateOperation(operation: any, index: number): void {
	const opField = `operations[${index}]`;

	validateSingleFileOperation(operation, index);

	// Validate optional fields
	if (operation.skipIfExists !== undefined) {
		validateBoolean(operation.skipIfExists, `${opField}.skipIfExists`);
	}

	if (operation.overwrite !== undefined) {
		validateBoolean(operation.overwrite, `${opField}.overwrite`);
	}

	// Check for conflicting options
	if (operation.skipIfExists && operation.overwrite) {
		throw new ValidationError(opField, "cannot have both skipIfExists and overwrite set to true");
	}
}

/**
 * Validates an amend operation (append/prepend)
 */
function validateAmendOperation(operation: any, index: number): void {
	const opField = `operations[${index}]`;

	validateSingleFileOperation(operation, index);

	// Validate optional fields
	if (operation.separator !== undefined) {
		if (typeof operation.separator !== "string") {
			throw new ValidationError(`${opField}.separator`, "must be a string");
		}
	}

	if (operation.unique !== undefined) {
		validateBoolean(operation.unique, `${opField}.unique`);
	}

	if (operation.pattern !== undefined) {
		if (typeof operation.pattern !== "string" && !(operation.pattern instanceof RegExp)) {
			throw new ValidationError(`${opField}.pattern`, "must be a string or RegExp");
		}
	}
}

/**
 * Validates a createAll operation
 */
function validateCreateAllOperation(operation: any, index: number): void {
	const opField = `operations[${index}]`;

	// Validate required fields
	if (!operation.destinationPath) {
		throw new ValidationError(`${opField}.destinationPath`, "is required");
	}
	validateNonEmptyString(operation.destinationPath, `${opField}.destinationPath`);

	if (!operation.templateFilesGlob) {
		throw new ValidationError(`${opField}.templateFilesGlob`, "is required");
	}
	validateNonEmptyString(operation.templateFilesGlob, `${opField}.templateFilesGlob`);

	// Validate optional fields
	if (operation.templateBasePath !== undefined) {
		validateNonEmptyString(operation.templateBasePath, `${opField}.templateBasePath`);
	}

	if (operation.verbose !== undefined) {
		validateBoolean(operation.verbose, `${opField}.verbose`);
	}

	if (operation.skipIfExists !== undefined) {
		validateBoolean(operation.skipIfExists, `${opField}.skipIfExists`);
	}

	if (operation.overwrite !== undefined) {
		validateBoolean(operation.overwrite, `${opField}.overwrite`);
	}

	// Check for conflicting options
	if (operation.skipIfExists && operation.overwrite) {
		throw new ValidationError(opField, "cannot have both skipIfExists and overwrite set to true");
	}
}

/**
 * Validates a forMany operation
 */
function validateForManyOperation(operation: any, index: number): void {
	const opField = `operations[${index}]`;

	// Validate required fields
	if (!operation.generatorId) {
		throw new ValidationError(`${opField}.generatorId`, "is required");
	}
	validateNonEmptyString(operation.generatorId, `${opField}.generatorId`);

	if (operation.items === undefined) {
		throw new ValidationError(`${opField}.items`, "is required");
	}

	// Validate items - can be array or function
	if (!Array.isArray(operation.items) && typeof operation.items !== "function") {
		throw new ValidationError(`${opField}.items`, "must be an array or function");
	}

	if (Array.isArray(operation.items) && operation.items.length === 0) {
		throw new ValidationError(`${opField}.items`, "array cannot be empty");
	}

	// Validate optional transformItem
	if (operation.transformItem !== undefined) {
		validateFunction(operation.transformItem, `${opField}.transformItem`);
	}
}

/**
 * Validates an operation based on its type
 */
function validateOperation(operation: any, index: number): void {
	validateBaseOperation(operation, index);

	// Type-specific validation
	switch (operation.type) {
		case "create":
			validateCreateOperation(operation, index);
			break;
		case "append":
		case "prepend":
			validateAmendOperation(operation, index);
			break;
		case "createAll":
			validateCreateAllOperation(operation, index);
			break;
		case "forMany":
			validateForManyOperation(operation, index);
			break;
	}
}

/**
 * Validates a generator configuration
 */
export function validateGenerator(id: string, generator: any): void {
	logger.info(`Validating generator: ${id}`);

	try {
		// Validate id
		validateNonEmptyString(id, "generator id");

		// Validate generator is an object
		if (!generator || typeof generator !== "object") {
			throw new ValidationError("generator", "must be an object");
		}

		// Validate description
		if (!generator.description) {
			throw new ValidationError("generator.description", "is required");
		}
		validateNonEmptyString(generator.description, "generator.description");

		// Validate prompts if present
		if (generator.prompts !== undefined) {
			validateArray(generator.prompts, "generator.prompts");
			generator.prompts.forEach((prompt: any, index: number) => {
				validatePrompt(prompt, index);
			});
		}

		// Validate operations
		if (!generator.operations) {
			throw new ValidationError("generator.operations", "is required");
		}
		validateArray(generator.operations, "generator.operations");

		if (generator.operations.length === 0) {
			throw new ValidationError("generator.operations", "cannot be empty");
		}

		// Validate each operation
		generator.operations.forEach((operation: any, index: number) => {
			validateOperation(operation, index);
		});

		// Cross-validate forMany operations reference existing generators
		generator.operations.forEach((operation: any, index: number) => {
			if (operation.type === "forMany" && operation.generatorId === id) {
				logger.warn(`Warning: operations[${index}] references itself (${id}), this could cause infinite recursion`);
			}
		});

		logger.success(`Generator "${id}" validation passed`);
	} catch (err) {
		logger.error(`Generator "${id}" validation failed`);
		throw err;
	}
}

/**
 * Validates a helper function
 */
export function validateHelper(name: string, helper: any): void {
	logger.info(`Validating helper: ${name}`);

	try {
		validateNonEmptyString(name, "helper name");
		validateFunction(helper, "helper function");

		// Check for reserved names
		const reservedNames = ["if", "unless", "each", "with", "lookup", "log"];
		if (reservedNames.includes(name)) {
			throw new ValidationError("helper name", `"${name}" is a reserved Handlebars helper name`);
		}

		logger.success(`Helper "${name}" validation passed`);
	} catch (err) {
		logger.error(`Helper "${name}" validation failed`);
		throw err;
	}
}

/**
 * Validates a partial template
 */
export function validatePartial(name: string, partial: any): void {
	logger.info(`Validating partial: ${name}`);

	try {
		validateNonEmptyString(name, "partial name");

		if (typeof partial !== "string" && typeof partial !== "function") {
			throw new ValidationError("partial", "must be a string or template function");
		}

		logger.success(`Partial "${name}" validation passed`);
	} catch (err) {
		logger.error(`Partial "${name}" validation failed`);
		throw err;
	}
}

/**
 * Validates a partial file path
 */
export function validatePartialFilePath(name: string, filePath: string): void {
	logger.info(`Validating partial file: ${name} -> ${filePath}`);

	try {
		validateNonEmptyString(name, "partial name");
		validateNonEmptyString(filePath, "partial file path");

		// Check for common file extensions
		const hasValidExtension = expectedPartialFileTypes.some((ext) => filePath.toLowerCase().endsWith(ext));

		if (!hasValidExtension) {
			logger.warn(
				`Warning: Partial file "${filePath}" doesn't have a common template extension (${expectedPartialFileTypes.join(", ")})`,
			);
		}

		logger.success(`Partial file "${name}" validation passed`);
	} catch (err) {
		logger.error(`Partial file "${name}" validation failed`);
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
};
