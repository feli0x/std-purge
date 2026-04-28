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
      "--write",
      "--json",
      "--keep",
      "page.about"
    ]);

    expect(options).toMatchObject({
      themePath: "./theme",
      dryRun: true,
      help: false,
      write: true,
      json: true,
      keepTemplates: ["page.about"]
    });
  });

  it("parses shorthands", () => {
    expect(parseArgs(["-p", "./theme"]).themePath).toBe("./theme");
    expect(parseArgs(["-d"]).dryRun).toBe(true);
    expect(parseArgs(["-w"]).write).toBe(true);
    expect(parseArgs(["-j"]).json).toBe(true);
    expect(parseArgs(["-k", "page.about"]).keepTemplates).toEqual(["page.about"]);
  });
});
