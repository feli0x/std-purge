import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { CliError } from "./errors.js";

export async function assertDirectory(directoryPath: string): Promise<void> {
  try {
    const fileStat = await stat(directoryPath);
    if (!fileStat.isDirectory()) {
      throw new CliError(`Expected a directory: ${directoryPath}`);
    }
  } catch (error) {
    if (error instanceof CliError) {
      throw error;
    }
    throw new CliError(`Directory does not exist: ${directoryPath}`);
  }
}

export async function findFiles(directoryPath: string): Promise<string[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map((entry) => findEntryFiles(directoryPath, entry.name, entry.isDirectory()))
  );

  return nestedFiles.flat();
}

async function findEntryFiles(
  parentPath: string,
  entryName: string,
  isDirectory: boolean
): Promise<string[]> {
  const entryPath = path.join(parentPath, entryName);

  if (!isDirectory) {
    return [entryPath];
  }

  return findFiles(entryPath);
}

export async function readJsonFile(filePath: string): Promise<unknown> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new CliError(`Malformed JSON: ${filePath}`);
    }
    throw new CliError(`Unable to read JSON file: ${filePath}`);
  }
}

export function formatJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function toRelativePath(rootPath: string, filePath: string): string {
  return path.relative(rootPath, filePath).split(path.sep).join("/");
}
