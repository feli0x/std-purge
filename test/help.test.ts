import { describe, expect, it } from "vitest";
import { renderHelp } from "../src/help.js";

describe("renderHelp", () => {
  it("documents usage, options, behavior, and examples", () => {
    const help = renderHelp();

    expect(help).toContain("Usage:");
    expect(help).toContain("--path <dir>");
    expect(help).toContain("-d, --dry-run");
    expect(help).toContain("-w, --write");
    expect(help).toContain("--json");
    expect(help).toContain("-k, --keep <name>");
    expect(help).toContain("-h, --help");
  });
});
