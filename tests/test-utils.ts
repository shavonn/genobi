import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { store } from "../src/config-store";

export async function createTmpDir(prefix = "vitest-genobi-") {
	const dir = await mkdtemp(join(tmpdir(), prefix));
	store.setDestinationBasePath(dir);
	return dir;
}

export function getTmpDir(): string {
	const dir = store.state().destinationBasePath;
	if (!dir) throw new Error("TMPDIR not set. createTmpDir() must be called.");
	return dir;
}

export async function cleanUpTmpDir() {
	const dir = store.state().destinationBasePath;
	await rm(dir, { recursive: true, force: true });
}

function checkTmpdirPrefix(str: string) {
	return str.startsWith(process.env.VITEST_GENOBI_TMPDIR as string);
}

export function getTmpDirPath(p?: any): string {
	if (p === undefined) {
		return getTmpDir();
	}
	if (typeof p !== "string" || checkTmpdirPrefix(p)) {
		return p;
	}
	return resolve(join(getTmpDir(), p));
}
