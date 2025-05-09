import { execSync } from "node:child_process";

function escapeRegExp(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isGlobalInstall() {
	try {
		const globalNodeModules = execSync("npm root -g").toString().trim();
		const currentPath = __dirname;

		return currentPath.startsWith(globalNodeModules);
	} catch (_err: any) {
		return false;
	}
}

const common = {
	escapeRegExp,
	isGlobalInstall,
};
export { common };
