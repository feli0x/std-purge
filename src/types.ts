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
  isNew: boolean;
};

export type CleanupPlan = {
  themePath: string;
  templateRemovals: TemplateRemoval[];
  fileRewrites: FileRewrite[];
  warnings: string[];
};

export type ThemeCheckConfig = {
  extends: string;
  enabledChecks: number;
};

export type ThemeCheckOffense = {
  check: string;
  severity: string;
  start_row: number;
  start_column: number;
  end_row: number;
  end_column: number;
  message: string;
};

export type ThemeCheckFileResult = {
  path: string;
  offenses: ThemeCheckOffense[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
};
