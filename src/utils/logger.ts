import chalk from "chalk";
import { store } from "../config-store";

/**
 * Logs debug information to the console.
 * Only outputs when debug logging is enabled.
 *
 * @param {string} msg - The message to log
 * @param {...any} args - Additional arguments to log
 */
function logDebug(msg: string, ...args: any[]): void {
	if (store.state().logDebug) {
		console.debug(chalk.cyanBright("[Debug]"), msg, ...args);
	}
}

/**
 * Logs error messages to the console.
 * Always outputs regardless of log settings.
 *
 * @param {string} msg - The error message to log
 * @param {...any} args - Additional arguments to log
 */
function logError(msg: string, ...args: any[]): void {
	console.error(chalk.red(msg), ...args);
}

/**
 * Logs informational messages to the console.
 * Only outputs when verbose logging is enabled.
 *
 * @param {string} msg - The info message to log
 * @param {...any} args - Additional arguments to log
 */
function logInfo(msg: string, ...args: any[]): void {
	if (store.state().logVerbose) {
		console.info(chalk.blue(msg), ...args);
	}
}

/**
 * Logs success messages to the console.
 * Always outputs regardless of log settings.
 *
 * @param {string} msg - The success message to log
 * @param {...any} args - Additional arguments to log
 */
function logSuccess(msg: string, ...args: any[]): void {
	console.log(chalk.green(msg), ...args);
}

/**
 * Logs warning messages to the console.
 * Always outputs regardless of log settings.
 *
 * @param {string} msg - The warning message to log
 * @param {...any} args - Additional arguments to log
 */
function logWarn(msg: string, ...args: any[]): void {
	console.warn(chalk.yellow(msg), ...args);
}

/**
 * A utility for logging messages to the console with different levels of severity.
 */
const logger = {
	/** Log debug information (only shows when debug mode is enabled) */
	debug: logDebug,
	/** Log errors (always shown) */
	error: logError,
	/** Log informational messages (only shows when verbose mode is enabled) */
	info: logInfo,
	/** Log success messages (always shown) */
	success: logSuccess,
	/** Log warning messages (always shown) */
	warn: logWarn,
};
export { logger };
