import chalk from "chalk";
import { store } from "../config-store";

function logDebug(msg: string, ...args: any[]): void {
	if (store.state().logDebug) {
		console.debug(chalk.cyanBright("[Debug]"), msg, ...args);
	}
}

function logError(msg: string, ...args: any[]): void {
	console.error(chalk.red(msg), ...args);
}

function logInfo(msg: string, ...args: any[]): void {
	if (store.state().logVerbose) {
		console.info(chalk.blue(msg), ...args);
	}
}

function logSuccess(msg: string, ...args: any[]): void {
	console.log(chalk.green(msg), ...args);
}

function logWarn(msg: string, ...args: any[]): void {
	console.warn(chalk.yellow(msg), ...args);
}

const logger = {
	debug: logDebug,
	error: logError,
	info: logInfo,
	success: logSuccess,
	warn: logWarn,
};
export { logger };
