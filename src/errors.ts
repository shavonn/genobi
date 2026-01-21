import type { ErrorName } from "./types/general";

/**
 * Base error class for all Genobi errors.
 * Provides consistent error handling with error name, message, and optional cause.
 * Uses native ES2022 Error cause support.
 */
export class GenobiError extends Error {
	/** Specific name identifying the error type */
	override name: ErrorName;

	/**
	 * Creates a new Genobi error.
	 *
	 * @param {ErrorName} name - The error name/type
	 * @param {string} message - Error message describing what went wrong
	 * @param {unknown} [cause] - Optional underlying error that caused this error
	 */
	constructor(name: ErrorName, message: string, cause?: unknown) {
		super(message, cause !== undefined ? { cause } : undefined);
		this.name = name;
	}
}

/**
 * Error thrown when validation fails for a configuration field
 */
export class ValidationError extends GenobiError {
	/** The field that failed validation */
	field: string;

	/**
	 * Creates a new validation error.
	 *
	 * @param {string} field - The field that failed validation
	 * @param {string} message - Specific validation failure message
	 */
	constructor(field: string, message: string) {
		super("VALIDATION_ERROR", `Validation failed for ${field}: ${message}`);
		this.field = field;
	}
}

/**
 * Error thrown when file writing fails.
 */
export class WriteError extends GenobiError {
	/**
	 * Creates a new write error.
	 *
	 * @param {string} filePath - Path to the file that couldn't be written
	 * @param {unknown} [cause] - Optional underlying error that caused this error
	 */
	constructor(filePath: string, cause?: unknown) {
		super("WRITE_ERROR", `Error writing file: ${filePath}`, cause);
	}
}

/**
 * Error thrown when attempting to create a file that already exists.
 */
export class FileExistsError extends GenobiError {
	/**
	 * Creates a new file exists error.
	 *
	 * @param {string} filePath - Path to the file that already exists
	 */
	constructor(filePath: string) {
		super("FILE_EXISTS", `File already exists: ${filePath}`);
	}
}

/**
 * Error thrown when directory creation fails.
 */
export class MakeDirError extends GenobiError {
	/**
	 * Creates a new directory creation error.
	 *
	 * @param {string} dirPath - Path to the directory that couldn't be created
	 */
	constructor(dirPath: string) {
		super("MKDIR_DIR_ERROR", `Error creating directory: ${dirPath}`);
	}
}

/**
 * Error thrown when file reading fails.
 */
export class ReadError extends GenobiError {
	/**
	 * Creates a new read error.
	 *
	 * @param {string} filePath - Path to the file that couldn't be read
	 * @param {unknown} [cause] - Optional underlying error that caused this error
	 */
	constructor(filePath: string, cause?: unknown) {
		super("READ_ERROR", `Error reading file: ${filePath}`, cause);
	}
}

/**
 * Error thrown when loading or processing the config file fails.
 */
export class ConfigLoadError extends GenobiError {
	/**
	 * Creates a new config load error.
	 *
	 * @param {string} message - Specific message about the config loading issue
	 * @param {unknown} [cause] - Optional underlying error that caused this error
	 */
	constructor(message: string, cause?: unknown) {
		super("CONFIG_LOAD_ERROR", message, cause);
	}
}

/**
 * Error thrown when an unknown operation type is encountered.
 */
export class UnknownOperationType extends GenobiError {
	/**
	 * Creates a new unknown operation type error.
	 *
	 * @param {string} type - The operation type that wasn't recognized
	 */
	constructor(type: string) {
		super("UNKNOWN_OPERATION_TYPE", `Unknown amendment operation type: ${type}.`);
	}
}

/**
 * Error thrown when a path attempts to escape the destination directory.
 */
export class PathTraversalError extends GenobiError {
	/**
	 * Creates a new path traversal error.
	 *
	 * @param {string} attemptedPath - The path that attempted to escape
	 * @param {string} rootPath - The root directory that should contain all paths
	 */
	constructor(attemptedPath: string, rootPath: string) {
		super(
			"PATH_TRAVERSAL_ERROR",
			`Path "${attemptedPath}" escapes the destination directory "${rootPath}". Paths must resolve within the destination base path.`,
		);
	}
}
