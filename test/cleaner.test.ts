import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { applyCleanupPlan, createCleanupPlan } from "../src/cleaner.js";

describe("cleaner", () => {
  it("plans and applies JSON-only cleanup", async () => {
    const themePath = await createThemeFixture();
    await writeJson(path.join(themePath, "templates", "index.json"), {});
    await writeJson(path.join(themePath, "templates", "product.alt.json"), {});
    await writeFile(path.join(themePath, "templates", "product.alt.liquid"), "");
    await writeJson(path.join(themePath, "sections", "custom.json"), {});
    await writeJson(path.join(themePath, "config", "settings_schema.json"), [
      { settings: [{ type: "text", id: "name" }] }
    ]);
    await writeJson(path.join(themePath, "config", "settings_data.json"), {
      current: { name: "Old", stale: true }
    });

    const plan = await createCleanupPlan({
      themePath,
      dryRun: false,
      help: false,
      yes: true,
      json: false,
      keepTemplates: []
    });

    expect(plan.templateRemovals.map((removal) => removal.relativePath)).toEqual([
      "templates/product.alt.json"
    ]);

    await applyCleanupPlan(plan);

    await expect(readFile(path.join(themePath, "templates", "product.alt.json"))).rejects.toThrow();
    await expect(readFile(path.join(themePath, "templates", "product.alt.liquid"))).resolves.toBeDefined();
    await expect(readFile(path.join(themePath, "sections", "custom.json"))).resolves.toBeDefined();
  });
});

async function createThemeFixture(): Promise<string> {
  const themePath = await mkdtemp(path.join(os.tmpdir(), "shopify-theme-clean-"));

  await mkdir(path.join(themePath, "templates"));
  await mkdir(path.join(themePath, "sections"));
  await mkdir(path.join(themePath, "config"));

  return themePath;
}

async function writeJson(filePath: string, content: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(content, null, 2)}\n`);
}
