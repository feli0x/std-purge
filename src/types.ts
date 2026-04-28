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

export type SettingsRewrite = {
  absolutePath: string;
  relativePath: string;
  content: JsonObject;
};

export type CleanupPlan = {
  themePath: string;
  templateRemovals: TemplateRemoval[];
  settingsRewrite: SettingsRewrite | null;
  warnings: string[];
};
