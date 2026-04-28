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
    const settingsSchema = [
      { settings: [{ type: "text", id: "name" }] }
    ];
    const settingsData = {
      current: { name: "Old", stale: true }
    };
    await writeJson(path.join(themePath, "config", "settings_schema.json"), settingsSchema);
    await writeJson(path.join(themePath, "config", "settings_data.json"), settingsData);

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
    expect(plan.fileRewrites.map((rewrite) => rewrite.relativePath)).toEqual([
      "sections/hello-world.liquid",
      "templates/index.json"
    ]);

    await applyCleanupPlan(plan);

    await expect(readFile(path.join(themePath, "templates", "product.alt.json"))).rejects.toThrow();
    await expect(readFile(path.join(themePath, "templates", "product.alt.liquid"))).resolves.toBeDefined();
    await expect(readFile(path.join(themePath, "sections", "custom.json"))).resolves.toBeDefined();
    await expect(readFile(path.join(themePath, "sections", "hello-world.liquid"), "utf8")).resolves.toContain(
      "Hello world"
    );
    await expect(readJson(path.join(themePath, "templates", "index.json"))).resolves.toEqual({
      sections: {
        hello_world: {
          type: "hello-world",
          settings: {}
        }
      },
      order: ["hello_world"]
    });
    await expect(readJson(path.join(themePath, "config", "settings_schema.json"))).resolves.toEqual(settingsSchema);
    await expect(readJson(path.join(themePath, "config", "settings_data.json"))).resolves.toEqual(settingsData);
  });

  it("does not overwrite an existing hello-world section", async () => {
    const themePath = await createThemeFixture();
    const existingSection = "<section>Existing hello</section>\n";
    await writeJson(path.join(themePath, "templates", "index.json"), {});
    await writeFile(path.join(themePath, "sections", "hello-world.liquid"), existingSection);
    await writeJson(path.join(themePath, "config", "settings_schema.json"), []);
    await writeJson(path.join(themePath, "config", "settings_data.json"), { current: {} });

    const plan = await createCleanupPlan({
      themePath,
      dryRun: false,
      help: false,
      yes: true,
      json: false,
      keepTemplates: []
    });

    expect(plan.fileRewrites.map((rewrite) => rewrite.relativePath)).not.toContain(
      "sections/hello-world.liquid"
    );

    await applyCleanupPlan(plan);

    await expect(readFile(path.join(themePath, "sections", "hello-world.liquid"), "utf8")).resolves.toBe(
      existingSection
    );
  });
});

async function createThemeFixture(): Promise<string> {
  const themePath = await mkdtemp(path.join(os.tmpdir(), "std-purge-"));

  await mkdir(path.join(themePath, "templates"));
  await mkdir(path.join(themePath, "sections"));
  await mkdir(path.join(themePath, "config"));

  return themePath;
}

async function writeJson(filePath: string, content: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(content, null, 2)}\n`);
}

async function readJson(filePath: string): Promise<unknown> {
  return JSON.parse(await readFile(filePath, "utf8")) as unknown;
}
