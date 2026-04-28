import { CleanupPlan } from "./types.js";

export function renderTextReport(plan: CleanupPlan, dryRun: boolean): string {
  const lines = [
    `Theme: ${plan.themePath}`,
    `Mode: ${dryRun ? "dry-run" : "interactive"}`,
    "",
    "JSON templates to delete:"
  ];

  lines.push(...renderTemplateLines(plan));
  lines.push("", "Files to rewrite:");
  lines.push(...renderRewriteLines(plan));

  return lines.join("\n");
}

export function renderJsonReport(plan: CleanupPlan, dryRun: boolean): string {
  return JSON.stringify(
    {
      themePath: plan.themePath,
      dryRun,
      templateRemovals: plan.templateRemovals.map((removal) => removal.relativePath),
      fileRewrites: plan.fileRewrites.map((rewrite) => rewrite.relativePath),
      warnings: plan.warnings
    },
    null,
    2
  );
}

function renderRewriteLines(plan: CleanupPlan): string[] {
  if (plan.fileRewrites.length === 0) {
    return ["  none"];
  }

  return plan.fileRewrites.map((rewrite) => `  ${rewrite.relativePath}`);
}

function renderTemplateLines(plan: CleanupPlan): string[] {
  if (plan.templateRemovals.length === 0) {
    return ["  none"];
  }

  return plan.templateRemovals.map((removal) => `  ${removal.relativePath}`);
}
