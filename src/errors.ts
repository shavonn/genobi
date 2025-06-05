import type {ErrorName} from "./types/general";

/**
 * Base error class for all Genobi errors.
 * Provides consistent error handling with error name, message, and optional cause.
 */
export class GenobiError extends Error {
    /** Specific name identifying the error type */
    name: ErrorName;
    /** Error message providing details about what went wrong */
    message: string;
    /** Optional underlying cause of the error */
    cause: any;

    /**
     * Creates a new Genobi error.
     *
     * @param {ErrorName} name - The error name/type
     * @param {string} message - Error message describing what went wrong
     * @param {any} [cause] - Optional underlying error that caused this error
     */
    constructor(name: ErrorName, message: string, cause?: any) {
        super(message);
        this.name = name;
        this.message = message;
        this.cause = cause;
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
     * @param {any} [cause] - Optional underlying error that caused this error
     */
    constructor(filePath: string, cause?: any) {
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
     * @param {any} [cause] - Optional underlying error that caused this error
     */
    constructor(filePath: string, cause?: any) {
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
     * @param {any} [cause] - Optional underlying error that caused this error
     */
    constructor(message: string, cause?: any) {
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
