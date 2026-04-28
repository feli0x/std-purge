import path from "node:path";
import { TemplateRemoval } from "./types.js";
import { toRelativePath } from "./files.js";

const CORE_TEMPLATE_NAMES = new Set([
  "index",
  "product",
  "collection",
  "page",
  "cart",
  "search",
  "blog",
  "article",
  "gift_card",
  "robots",
  "password",
  "metaobject"
]);

export function findTemplateRemovals(
  themePath: string,
  allFiles: string[],
  extraKeepTemplates: string[]
): TemplateRemoval[] {
  const extraKeeps = new Set(extraKeepTemplates);

  return allFiles
    .filter((filePath) => isTemplateJson(themePath, filePath))
    .filter((filePath) => shouldRemoveTemplate(themePath, filePath, extraKeeps))
    .map((filePath) => ({
      absolutePath: filePath,
      relativePath: toRelativePath(themePath, filePath)
    }));
}

function isTemplateJson(themePath: string, filePath: string): boolean {
  const relativePath = toRelativePath(themePath, filePath);
  return relativePath.startsWith("templates/") && relativePath.endsWith(".json");
}

function shouldRemoveTemplate(
  themePath: string,
  filePath: string,
  extraKeeps: Set<string>
): boolean {
  const relativePath = toRelativePath(themePath, filePath);
  const templateName = path.basename(relativePath, ".json");
  const directoryName = path.dirname(relativePath);

  if (extraKeeps.has(relativePath) || extraKeeps.has(templateName)) {
    return false;
  }

  if (directoryName === "templates/customers") {
    return false;
  }

  return !CORE_TEMPLATE_NAMES.has(templateName);
}
