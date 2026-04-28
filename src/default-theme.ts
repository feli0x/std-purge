import path from "node:path";
import { formatJson } from "./files.js";
import { FileRewrite } from "./types.js";

const INDEX_TEMPLATE = {
  sections: {
    custom_liquid: {
      type: "custom-liquid",
      settings: {}
    }
  },
  order: ["custom_liquid"]
};

export function buildDefaultThemeRewrites(themePath: string, existingFiles: string[]): FileRewrite[] {
  return [
    buildFileRewrite(themePath, "templates/index.json", formatJson(INDEX_TEMPLATE), existingFiles)
  ];
}

function buildFileRewrite(themePath: string, relativePath: string, content: string, existingFiles: string[]): FileRewrite {
  return {
    absolutePath: path.join(themePath, relativePath),
    relativePath,
    content,
    isNew: !hasFile(themePath, existingFiles, relativePath)
  };
}

function hasFile(themePath: string, existingFiles: string[], relativePath: string): boolean {
  return existingFiles.includes(path.join(themePath, relativePath));
}
