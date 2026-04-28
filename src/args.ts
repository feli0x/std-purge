import { CliError } from "./errors.js";
import { CliOptions } from "./types.js";

export function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    themePath: process.cwd(),
    dryRun: false,
    help: false,
    yes: false,
    json: false,
    keepTemplates: []
  };

  for (let index = 0; index < args.length; index += 1) {
    index = parseArg(args, index, options);
  }

  return options;
}

function parseArg(args: string[], index: number, options: CliOptions): number {
  const arg = args[index];

  if (arg === "--path") {
    options.themePath = readValue(args, index, "--path");
    return index + 1;
  }

  if (arg === "--keep-template") {
    options.keepTemplates.push(readValue(args, index, "--keep-template"));
    return index + 1;
  }

  applyBooleanArg(arg, options);
  return index;
}

function applyBooleanArg(arg: string | undefined, options: CliOptions): void {
  if (arg === "--help" || arg === "-h") {
    options.help = true;
    return;
  }

  if (arg === "--dry-run") {
    options.dryRun = true;
    return;
  }

  if (arg === "--yes") {
    options.yes = true;
    return;
  }

  if (arg === "--json") {
    options.json = true;
    return;
  }

  throw new CliError(`Unknown argument: ${arg ?? ""}`);
}

function readValue(args: string[], index: number, flag: string): string {
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new CliError(`Missing value for ${flag}`);
  }

  return value;
}
