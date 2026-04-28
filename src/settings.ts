import path from "node:path";
import { access } from "node:fs/promises";
import { CliError } from "./errors.js";
import { readJsonFile } from "./files.js";
import { JsonObject, SettingsRewrite } from "./types.js";

type SettingDefinition = {
  id?: unknown;
  type?: unknown;
  default?: unknown;
  options?: unknown;
};

type SchemaGroup = {
  settings?: unknown;
};

export async function buildSettingsRewrite(themePath: string): Promise<SettingsRewrite> {
  const schemaPath = path.join(themePath, "config", "settings_schema.json");
  const dataPath = path.join(themePath, "config", "settings_data.json");

  await assertFileExists(schemaPath, "Missing config/settings_schema.json");
  await assertFileExists(dataPath, "Missing config/settings_data.json");

  return {
    absolutePath: dataPath,
    relativePath: "config/settings_data.json",
    content: { current: buildDefaultSettings(await readSettingsSchema(schemaPath)) }
  };
}

async function assertFileExists(filePath: string, message: string): Promise<void> {
  try {
    await access(filePath);
  } catch {
    throw new CliError(message);
  }
}

async function readSettingsSchema(schemaPath: string): Promise<SchemaGroup[]> {
  const schema = await readJsonFile(schemaPath);
  if (!Array.isArray(schema)) {
    throw new CliError("config/settings_schema.json must contain an array");
  }

  return schema as SchemaGroup[];
}

function buildDefaultSettings(schemaGroups: SchemaGroup[]): JsonObject {
  const settings: JsonObject = {};

  for (const setting of schemaGroups.flatMap(readGroupSettings)) {
    if (typeof setting.id === "string") {
      settings[setting.id] = defaultSettingValue(setting);
    }
  }

  return settings;
}

function readGroupSettings(group: SchemaGroup): SettingDefinition[] {
  if (!Array.isArray(group.settings)) {
    return [];
  }

  return group.settings as SettingDefinition[];
}

function defaultSettingValue(setting: SettingDefinition): unknown {
  if ("default" in setting) {
    return setting.default;
  }

  if (typeof setting.type !== "string") {
    return null;
  }

  return blankValueForType(setting.type, setting.options);
}

function blankValueForType(type: string, options: unknown): unknown {
  if (["checkbox"].includes(type)) {
    return false;
  }

  if (["number", "range"].includes(type)) {
    return 0;
  }

  if (type.endsWith("_list")) {
    return [];
  }

  if (["select", "radio"].includes(type)) {
    return firstOptionValue(options);
  }

  return blankScalarValue(type);
}

function firstOptionValue(options: unknown): unknown {
  if (!Array.isArray(options)) {
    return null;
  }

  const [firstOption] = options as JsonObject[];
  return firstOption?.value ?? null;
}

function blankScalarValue(type: string): unknown {
  if (["image_picker", "video", "font_picker", "color"].includes(type)) {
    return null;
  }

  return "";
}
