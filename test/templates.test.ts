import path from "node:path";
import { describe, expect, it } from "vitest";
import { findTemplateRemovals } from "../src/templates.js";

describe("findTemplateRemovals", () => {
  it("removes non-core template JSON files and keeps core templates", () => {
    const themePath = "/theme";
    const files = [
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
