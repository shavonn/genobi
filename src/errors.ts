type ErrorName =
	| "CONFIG_ERROR"
	| "MISSING_OPERATIONS_ERROR"
	| "GENERATOR_NOT_FOUND"
	| "HELPER_NOT_FOUND"
	| "UNKNOWN_OPERATION_TYPE"
	| "NO_TEMPLATE_FOUND"
	| "READ_ERROR"
	| "WRITE_ERROR"
	| "FILE_EXISTS"
	| "TEMPLATE_PROCESSING_ERROR";

export class GenobiError extends Error {
	name: ErrorName;
	message: string;
	cause: any;

	constructor(name: ErrorName, message: string, cause?: any) {
		super(message);
		this.name = name;
		this.message = message;
		this.cause = cause;
	}
}

export class OperationWriteError extends GenobiError {
	constructor(filePath: string, cause?: any) {
		super("WRITE_ERROR", `Error writing file: ${filePath}`, cause);
	}
}

export class OperationFileExistsError extends GenobiError {
	constructor(filePath: string) {
		super("FILE_EXISTS", `File already exists: ${filePath}`);
	}
}

export class OperationReadError extends GenobiError {
	constructor(filePath: string, cause?: any) {
		super("READ_ERROR", `Error reading file: ${filePath}`, cause);
	}
}

export class ConfigError extends GenobiError {
	constructor(message: string) {
		super("CONFIG_ERROR", message);
	}
}

export class UnknownOperationType extends GenobiError {
	constructor(type: string) {
		super("UNKNOWN_OPERATION_TYPE", `Unknown amendment operation type: ${type}.`);
	}
}
