import { describe, expect, it } from "vitest";
import { parseArgs } from "../src/args.js";

describe("parseArgs", () => {
  it("parses help flags", () => {
    expect(parseArgs(["--help"]).help).toBe(true);
    expect(parseArgs(["-h"]).help).toBe(true);
  });

  it("parses cleanup options", () => {
    const options = parseArgs([
      "--path",
      "./theme",
      "--dry-run",
      "--yes",
      "--json",
      "--keep-template",
      "page.about"
    ]);

    expect(options).toMatchObject({
      themePath: "./theme",
      dryRun: true,
      help: false,
      yes: true,
      json: true,
      keepTemplates: ["page.about"]
    });
  });
});
