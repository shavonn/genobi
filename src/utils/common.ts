import { execSync } from "node:child_process";

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
	} catch (_err: any) {
		return false;
	}
}

/**
 * Common utility functions used throughout the application.
 */
const common = {
	escapeRegExp,
	isGlobalInstall,
};
export { common };
