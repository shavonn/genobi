import { execSync } from "node:child_process";

/**
 * Extracts an error message from an unknown error value.
 * Safely handles Error objects, strings, and other types.
 *
 * @param {unknown} err - The error value to extract a message from
 * @returns {string} The error message
 */
function getErrorMessage(err: unknown): string {
	if (err instanceof Error) {
		return err.message;
	}
	if (typeof err === "string") {
		return err;
	}
	return String(err);
}

/**
 * Type guard to check if an unknown value is an Error-like object.
 *
 * @param {unknown} err - The value to check
 * @returns {boolean} True if the value has error-like properties
 */
function isErrorWithMessage(err: unknown): err is { message: string } {
	return (
		typeof err === "object" &&
		err !== null &&
		"message" in err &&
		typeof (err as { message: unknown }).message === "string"
	);
}

/**
 * Type guard to check if an unknown value has a stack trace.
 *
 * @param {unknown} err - The value to check
 * @returns {boolean} True if the value has a stack property
 */
function isErrorWithStack(err: unknown): err is { stack: string } {
	return (
		typeof err === "object" && err !== null && "stack" in err && typeof (err as { stack: unknown }).stack === "string"
	);
}

/**
 * Escapes special characters in a string for use in a regular expression.
 *
 * @param {string} str - The string to escape
 * @returns {string} The escaped string, safe for use in a RegExp
 *
 * @example
 * escapeRegExp("hello.world") => "hello\\.world"
 */
function escapeRegExp(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Determines if Genobi is installed globally.
 * This is used to decide where to search for configuration files.
 *
 * @returns {boolean} True if Genobi is installed globally
 */
function isGlobalInstall(): boolean {
	try {
		const globalNodeModules = execSync("npm root -g").toString().trim();
		return __dirname.startsWith(globalNodeModules);
	} catch {
		return false;
	}
}

/**
 * Common utility functions used throughout the application.
 */
const common = {
	escapeRegExp,
	getErrorMessage,
	isErrorWithMessage,
	isErrorWithStack,
	isGlobalInstall,
};
export { common };
