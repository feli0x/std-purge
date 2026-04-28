import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildCoreTemplateRewrites, findTemplateRemovals } from "../src/templates.js";

describe("findTemplateRemovals", () => {
  it("removes non-core template JSON files and keeps core templates", () => {
    const themePath = "/theme";
    const files = [
      "/theme/templates/404.json",
      "/theme/templates/index.json",
      "/theme/templates/product.json",
      "/theme/templates/product.alternate.json",
      "/theme/templates/page.contact.json",
      "/theme/templates/customers/login.json",
      "/theme/sections/product.json",
      "/theme/templates/article.json",
      "/theme/templates/article.liquid"
    ];

    const removals = findTemplateRemovals(themePath, files, []);

    expect(removals.map((removal) => removal.relativePath)).toEqual([
      "templates/product.alternate.json",
      "templates/page.contact.json"
    ]);
  });

  it("keeps user-provided template overrides", () => {
    const themePath = path.join("tmp", "theme");
    const files = [path.join("tmp", "theme", "templates", "page.contact.json")];

    const removals = findTemplateRemovals(themePath, files, ["page.contact"]);

    expect(removals).toEqual([]);
  });
});

describe("buildCoreTemplateRewrites", () => {
  it("strips a multi-section core template to its first section", async () => {
    const themePath = await createTemplateFixture();
    await writeJson(path.join(themePath, "templates", "product.json"), {
      sections: {
        main: { type: "main-product", settings: {} },
        recs: { type: "product-recommendations", settings: {} }
      },
      order: ["main", "recs"]
    });

    const rewrites = await buildCoreTemplateRewrites(themePath, [
      path.join(themePath, "templates", "product.json")
    ]);

    expect(rewrites).toHaveLength(1);
    expect(rewrites[0].relativePath).toBe("templates/product.json");
    expect(rewrites[0].isNew).toBe(false);
    expect(JSON.parse(rewrites[0].content)).toEqual({
      sections: { main: { type: "main-product", settings: {} } },
      order: ["main"]
    });
  });

  it("skips a template that already has one section", async () => {
    const themePath = await createTemplateFixture();
    await writeJson(path.join(themePath, "templates", "collection.json"), {
      sections: { main: { type: "main-collection", settings: {} } },
      order: ["main"]
    });

    const rewrites = await buildCoreTemplateRewrites(themePath, [
      path.join(themePath, "templates", "collection.json")
    ]);

    expect(rewrites).toHaveLength(0);
  });

  it("skips a template with zero sections", async () => {
    const themePath = await createTemplateFixture();
    await writeJson(path.join(themePath, "templates", "page.json"), {
      sections: {},
      order: []
    });

    const rewrites = await buildCoreTemplateRewrites(themePath, [
      path.join(themePath, "templates", "page.json")
    ]);

    expect(rewrites).toHaveLength(0);
  });

  it("skips templates/index.json", async () => {
    const themePath = await createTemplateFixture();
    await writeJson(path.join(themePath, "templates", "index.json"), {
      sections: { a: {}, b: {} },
      order: ["a", "b"]
    });

    const rewrites = await buildCoreTemplateRewrites(themePath, [
      path.join(themePath, "templates", "index.json")
    ]);

    expect(rewrites).toHaveLength(0);
  });

  it("handles multiple core templates in one call", async () => {
    const themePath = await createTemplateFixture();
    await writeJson(path.join(themePath, "templates", "product.json"), {
      sections: { main: {}, recs: {} },
      order: ["main", "recs"]
    });
    await writeJson(path.join(themePath, "templates", "collection.json"), {
      sections: { main: {}, banner: {} },
      order: ["main", "banner"]
    });

    const rewrites = await buildCoreTemplateRewrites(themePath, [
      path.join(themePath, "templates", "product.json"),
      path.join(themePath, "templates", "collection.json")
    ]);

    expect(rewrites.map((r) => r.relativePath).sort()).toEqual([
      "templates/collection.json",
      "templates/product.json"
    ]);
  });

  it("does not rewrite non-core template variants", async () => {
    const themePath = await createTemplateFixture();
    await writeJson(path.join(themePath, "templates", "product.alternate.json"), {
      sections: { main: {}, extra: {} },
      order: ["main", "extra"]
    });

    const rewrites = await buildCoreTemplateRewrites(themePath, [
      path.join(themePath, "templates", "product.alternate.json")
    ]);

    expect(rewrites).toHaveLength(0);
  });
});

async function createTemplateFixture(): Promise<string> {
  const themePath = await mkdtemp(path.join(os.tmpdir(), "std-purge-"));
  await mkdir(path.join(themePath, "templates"));
  return themePath;
}

async function writeJson(filePath: string, content: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(content, null, 2)}\n`);
}
