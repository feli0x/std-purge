import { unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { CleanupPlan, CliOptions } from "./types.js";
import { assertDirectory, findFiles, formatJson } from "./files.js";
import { buildSettingsRewrite } from "./settings.js";
import { findTemplateRemovals } from "./templates.js";

export async function createCleanupPlan(options: CliOptions): Promise<CleanupPlan> {
  const themePath = path.resolve(options.themePath);
  const templatesPath = path.join(themePath, "templates");

  await assertDirectory(themePath);
  await assertDirectory(templatesPath);

  const allFiles = await findFiles(themePath);

  return {
    themePath,
    templateRemovals: findTemplateRemovals(themePath, allFiles, options.keepTemplates),
    settingsRewrite: await buildSettingsRewrite(themePath),
    warnings: []
  };
}

export async function applyCleanupPlan(plan: CleanupPlan): Promise<void> {
  for (const removal of plan.templateRemovals) {
    await unlink(removal.absolutePath);
  }

  if (plan.settingsRewrite) {
    await writeFile(plan.settingsRewrite.absolutePath, formatJson(plan.settingsRewrite.content));
  }
}
