import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
