export type JsonObject = Record<string, unknown>;

export type CliOptions = {
  themePath: string;
  dryRun: boolean;
  help: boolean;
  yes: boolean;
  json: boolean;
  keepTemplates: string[];
};

export type TemplateRemoval = {
  absolutePath: string;
  relativePath: string;
};

export type FileRewrite = {
  absolutePath: string;
  relativePath: string;
  content: string;
};

export type CleanupPlan = {
  themePath: string;
  templateRemovals: TemplateRemoval[];
  fileRewrites: FileRewrite[];
  warnings: string[];
};
