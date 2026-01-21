import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
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

export async function loadTestFiles(files: Record<string, string>): Promise<void> {
  const writePromises = Object.entries(files).map(([filePath, content]) => writeTestFile(filePath, content));
  await Promise.all(writePromises);
}

export async function writeTestFile(filePath: string, content: string): Promise<void> {
  const fullPath = getTmpDirPath(filePath);
  const dirPath = dirname(fullPath);
  await mkdir(dirPath, { recursive: true });
  await writeFile(fullPath, content);
}
