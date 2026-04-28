import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildSettingsRewrite } from "../src/settings.js";

describe("buildSettingsRewrite", () => {
  it("resets settings data to schema defaults and blanks", async () => {
    const themePath = await createThemeFixture();
    await writeJson(path.join(themePath, "config", "settings_schema.json"), [
      {
        name: "Theme settings",
        settings: [
          { type: "text", id: "heading", default: "Welcome" },
          { type: "checkbox", id: "show_vendor" },
          { type: "range", id: "spacing" },
          { type: "select", id: "layout", options: [{ value: "grid" }] },
          { type: "paragraph", content: "Ignored" }
        ]
      }
    ]);
    await writeJson(path.join(themePath, "config", "settings_data.json"), {
      current: { heading: "Merchant value", stale: true }
    });

    const rewrite = await buildSettingsRewrite(themePath);

    expect(rewrite.content).toEqual({
      current: {
        heading: "Welcome",
        show_vendor: false,
        spacing: 0,
        layout: "grid"
      }
    });
  });

  it("fails on malformed settings schema JSON", async () => {
    const themePath = await createThemeFixture();
    await writeFile(path.join(themePath, "config", "settings_schema.json"), "{");
    await writeJson(path.join(themePath, "config", "settings_data.json"), { current: {} });

    await expect(buildSettingsRewrite(themePath)).rejects.toThrow("Malformed JSON");
  });
});

async function createThemeFixture(): Promise<string> {
  const themePath = await mkdtemp(path.join(os.tmpdir(), "shopify-theme-clean-"));
  const configPath = path.join(themePath, "config");
  await mkdir(configPath);

  return themePath;
}

async function writeJson(filePath: string, content: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(content, null, 2)}\n`);
}
