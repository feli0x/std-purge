import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { CleanupPlan, CliOptions } from "./types.js";
import { assertDirectory, findFiles } from "./files.js";
import { buildDefaultThemeRewrites } from "./default-theme.js";
import { findTemplateRemovals, buildCoreTemplateRewrites } from "./templates.js";

export async function createCleanupPlan(options: CliOptions): Promise<CleanupPlan> {
  const themePath = path.resolve(options.themePath);
  const templatesPath = path.join(themePath, "templates");

  await assertDirectory(themePath);
  await assertDirectory(templatesPath);

  const allFiles = await findFiles(themePath);

  const coreTemplateRewrites = await buildCoreTemplateRewrites(themePath, allFiles);

  return {
    themePath,
    templateRemovals: findTemplateRemovals(themePath, allFiles, options.keepTemplates),
    fileRewrites: [...buildDefaultThemeRewrites(themePath, allFiles), ...coreTemplateRewrites],
    warnings: []
  };
}

export async function applyCleanupPlan(plan: CleanupPlan): Promise<void> {
  for (const removal of plan.templateRemovals) {
    await unlink(removal.absolutePath);
  }

  for (const rewrite of plan.fileRewrites) {
    await mkdir(path.dirname(rewrite.absolutePath), { recursive: true });
    await writeFile(rewrite.absolutePath, rewrite.content);
  }
}
