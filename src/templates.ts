import path from "node:path";
import { readJsonFile, formatJson, toRelativePath } from "./files.js";
import { FileRewrite, TemplateRemoval } from "./types.js";

type TemplateJson = {
  sections: Record<string, unknown>;
  order: string[];
};

function isTemplateData(value: unknown): value is TemplateJson {
  return (
    typeof value === "object" &&
    value !== null &&
    "order" in value &&
    Array.isArray((value as TemplateJson).order) &&
    "sections" in value &&
    typeof (value as TemplateJson).sections === "object"
  );
}

const CORE_TEMPLATE_NAMES = new Set([
  "404",
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

function isCoreNonIndexTemplateJson(themePath: string, filePath: string): boolean {
  const relativePath = toRelativePath(themePath, filePath);
  if (!relativePath.startsWith("templates/") || !relativePath.endsWith(".json")) return false;
  const templateName = path.basename(relativePath, ".json");
  return templateName !== "index" && CORE_TEMPLATE_NAMES.has(templateName);
}

export async function buildCoreTemplateRewrites(
  themePath: string,
  allFiles: string[]
): Promise<FileRewrite[]> {
  const coreFiles = allFiles.filter((f) => isCoreNonIndexTemplateJson(themePath, f));

  const rewrites = await Promise.all(
    coreFiles.map(async (filePath) => {
      const data = await readJsonFile(filePath);
      if (!isTemplateData(data) || data.order.length <= 1) return null;

      const mainKey = data.order[0] as string;
      const stripped = {
        sections: { [mainKey]: data.sections[mainKey] },
        order: [mainKey]
      };

      const rewrite: FileRewrite = {
        absolutePath: filePath,
        relativePath: toRelativePath(themePath, filePath),
        content: formatJson(stripped),
        isNew: false
      };
      return rewrite;
    })
  );

  return rewrites.filter((r): r is FileRewrite => r !== null);
}
