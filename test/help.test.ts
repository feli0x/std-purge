import { describe, expect, it } from "vitest";
import { renderHelp } from "../src/help.js";

describe("renderHelp", () => {
  it("documents usage, options, behavior, and examples", () => {
    const help = renderHelp();

    expect(help).toContain("Usage:");
    expect(help).toContain("--path <dir>");
    expect(help).toContain("--dry-run");
    expect(help).toContain("--yes");
    expect(help).toContain("--json");
    expect(help).toContain("--keep-template <name>");
    expect(help).toContain("-h, --help");
    expect(help).toContain("never touches .liquid files");
  });
});
