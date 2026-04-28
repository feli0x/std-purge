#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { parseArgs } from "./args.js";
import { createCleanupPlan, applyCleanupPlan } from "./cleaner.js";
import { CliError } from "./errors.js";
import { renderHelp } from "./help.js";
import { renderDryRun, renderSuccess, renderThemeCheckBanner, renderThemeCheckResults } from "./plan-report.js";
import { confirmCleanup, confirmThemeCheck } from "./prompt.js";
import { renderJsonReport } from "./report.js";
import type { ThemeCheckConfig, ThemeCheckFileResult } from "./types.js";

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(renderHelp());
    return;
  }

  const plan = await createCleanupPlan(options);

  if (options.json) {
    console.log(renderJsonReport(plan, options.dryRun));
    return;
  }

  if (options.dryRun) {
    await renderDryRun(plan);
    return;
  }

  if (!options.write && !(await confirmCleanup(plan))) {
    throw new CliError("Cleanup aborted", 2);
  }

  await applyCleanupPlan(plan);
  await renderSuccess(plan);

  if (await confirmThemeCheck()) {
    const printResult = spawnSync(
      "shopify", ["theme", "check", "--print", "--path", plan.themePath],
      { encoding: "utf8" }
    );
    const config = parseThemeCheckConfig(printResult.stdout ?? "");

    await renderThemeCheckBanner(plan.themePath, config);

    const checkResult = spawnSync(
      "shopify", ["theme", "check", "-o", "json", "--path", plan.themePath],
      { encoding: "utf8" }
    );

    let results: ThemeCheckFileResult[] = [];
    try {
      if (checkResult.stdout) results = JSON.parse(checkResult.stdout) as ThemeCheckFileResult[];
    } catch { /* leave results empty */ }

    await renderThemeCheckResults(results);
  }
}

function parseThemeCheckConfig(output: string): ThemeCheckConfig {
  let extendsVal = "";
  let enabledChecks = 0;
  for (const line of output.split("\n")) {
    if (line.startsWith("extends:")) {
      const val = line.slice("extends:".length).trim();
      if (!val.startsWith("[")) extendsVal = val;
    } else if (line.trim() === "enabled: true") {
      enabledChecks++;
    }
  }
  return { extends: extendsVal, enabledChecks };
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
