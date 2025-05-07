type ErrorName = "READ_ERROR" | "WRITE_ERROR" | "FILE_EXISTS";

export class OperationError extends Error {
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

export class OperationWriteError extends OperationError {
	constructor(filePath: string, cause?: any) {
		super("WRITE_ERROR", `Error writing file: ${filePath}`, cause);
	}
}

export class OperationFileExistsError extends OperationError {
	constructor(filePath: string) {
		super("FILE_EXISTS", `File already exists: ${filePath}`);
	}
}

export class OperationReadError extends OperationError {
	constructor(filePath: string, cause?: any) {
		super("READ_ERROR", `Error reading file: ${filePath}`, cause);
	}
}
