import type { ErrorName } from "./types/general";

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

export class WriteError extends GenobiError {
	constructor(filePath: string, cause?: any) {
		super("WRITE_ERROR", `Error writing file: ${filePath}`, cause);
	}
}

export class FileExistsError extends GenobiError {
	constructor(filePath: string) {
		super("FILE_EXISTS", `File already exists: ${filePath}`);
	}
}

export class MakeDirError extends GenobiError {
	constructor(dirPath: string) {
		super("MKDIR_DIR_ERROR", `Error creating directory: ${dirPath}`);
	}
}

export class ReadError extends GenobiError {
	constructor(filePath: string, cause?: any) {
		super("READ_ERROR", `Error reading file: ${filePath}`, cause);
	}
}

export class ConfigLoadError extends GenobiError {
	constructor(message: string, cause?: any) {
		super("CONFIG_LOAD_ERROR", message, cause);
	}
}

export class UnknownOperationType extends GenobiError {
	constructor(type: string) {
		super("UNKNOWN_OPERATION_TYPE", `Unknown amendment operation type: ${type}.`);
	}
}
