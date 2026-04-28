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
      write: true,
      json: false,
      keepTemplates: []
    });

    expect(plan.templateRemovals.map((removal) => removal.relativePath)).toEqual([
      "templates/product.alt.json"
    ]);
    expect(plan.fileRewrites.map((rewrite) => rewrite.relativePath)).toEqual([
      "templates/index.json"
    ]);

    await applyCleanupPlan(plan);

    await expect(readFile(path.join(themePath, "templates", "product.alt.json"))).rejects.toThrow();
    await expect(readFile(path.join(themePath, "templates", "product.alt.liquid"))).resolves.toBeDefined();
    await expect(readFile(path.join(themePath, "sections", "custom.json"))).resolves.toBeDefined();
    await expect(readJson(path.join(themePath, "templates", "index.json"))).resolves.toEqual({
      sections: {
        custom_liquid: {
          type: "custom-liquid",
          settings: {}
        }
      },
      order: ["custom_liquid"]
    });
    await expect(readJson(path.join(themePath, "config", "settings_schema.json"))).resolves.toEqual(settingsSchema);
    await expect(readJson(path.join(themePath, "config", "settings_data.json"))).resolves.toEqual(settingsData);
  });

  it("strips multi-section core templates to their first section", async () => {
    const themePath = await createThemeFixture();
    await writeJson(path.join(themePath, "templates", "index.json"), {});
    await writeJson(path.join(themePath, "templates", "product.json"), {
      sections: {
        main: { type: "main-product", settings: {} },
        recs: { type: "product-recommendations", settings: {} }
      },
      order: ["main", "recs"]
    });
    await writeJson(path.join(themePath, "templates", "collection.json"), {
      sections: { main: { type: "main-collection", settings: {} } },
      order: ["main"]
    });
    await writeJson(path.join(themePath, "config", "settings_schema.json"), []);
    await writeJson(path.join(themePath, "config", "settings_data.json"), { current: {} });

    const plan = await createCleanupPlan({
      themePath,
      dryRun: false,
      help: false,
      write: true,
      json: false,
      keepTemplates: []
    });

    expect(plan.fileRewrites.map((r) => r.relativePath)).toContain("templates/product.json");
    expect(plan.fileRewrites.map((r) => r.relativePath)).not.toContain("templates/collection.json");

    await applyCleanupPlan(plan);

    await expect(readJson(path.join(themePath, "templates", "product.json"))).resolves.toEqual({
      sections: { main: { type: "main-product", settings: {} } },
      order: ["main"]
    });
    await expect(readJson(path.join(themePath, "templates", "collection.json"))).resolves.toEqual({
      sections: { main: { type: "main-collection", settings: {} } },
      order: ["main"]
    });
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
