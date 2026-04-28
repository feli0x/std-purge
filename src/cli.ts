#!/usr/bin/env node
import { parseArgs } from "./args.js";
import { createCleanupPlan, applyCleanupPlan } from "./cleaner.js";
import { CliError } from "./errors.js";
import { renderHelp } from "./help.js";
import { confirmCleanup } from "./prompt.js";
import { renderJsonReport, renderTextReport } from "./report.js";

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(renderHelp());
    return;
  }

  const plan = await createCleanupPlan(options);
  const report = options.json
    ? renderJsonReport(plan, options.dryRun)
    : renderTextReport(plan, options.dryRun);

  console.log(report);

  if (options.dryRun) {
    return;
  }

  if (!options.yes && !(await confirmCleanup())) {
    throw new CliError("Cleanup aborted", 2);
  }

  await applyCleanupPlan(plan);
}

main().catch((error: unknown) => {
  if (error instanceof CliError) {
    console.error(error.message);
    process.exitCode = error.exitCode;
    return;
  }

  console.error(error);
  process.exitCode = 1;
});
