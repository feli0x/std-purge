import React, { useEffect } from "react";
import { Box, Text, useApp, render } from "ink";
import type { CleanupPlan, ThemeCheckConfig, ThemeCheckFileResult } from "./types.js";

function useAutoExit() {
  const { exit } = useApp();
  useEffect(() => { exit(); }, [exit]);
}

async function renderAndWait(element: React.ReactElement): Promise<void> {
  const { waitUntilExit } = render(element);
  await waitUntilExit();
}

export function FileList({ plan, bright = false }: { plan: CleanupPlan; bright?: boolean }) {
  const deletions = plan.templateRemovals.length;
  const rewrites = plan.fileRewrites.filter((r) => !r.isNew);
  const creates = plan.fileRewrites.filter((r) => r.isNew);
  const L = (s: string) => bright ? <Text color="white">{s}</Text> : <Text dimColor>{s}</Text>;
  const I = (s: string) => bright ? <Text color="white">{s}</Text> : <Text>{s}</Text>;

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        {L("Theme  ")}
        <Text color="cyan">{plan.themePath}</Text>
      </Box>

      <Box>
        {L("Delete  ")}
        {deletions === 0 ? (
          <Text dimColor>none</Text>
        ) : (
          <Text color="red" bold>{String(deletions)} file{deletions !== 1 ? "s" : ""}</Text>
        )}
      </Box>
      {plan.templateRemovals.map((r) => (
        <Box key={r.absolutePath} marginLeft={2}>
          <Text color="red">✕  </Text>
          {I(r.relativePath)}
        </Box>
      ))}

      <Box marginTop={1}>
        {L("Rewrite ")}
        {rewrites.length === 0 ? (
          <Text dimColor>none</Text>
        ) : (
          <Text color="yellow" bold>{String(rewrites.length)} file{rewrites.length !== 1 ? "s" : ""}</Text>
        )}
      </Box>
      {rewrites.map((r) => (
        <Box key={r.absolutePath} marginLeft={2}>
          <Text color="yellow">↻  </Text>
          {I(r.relativePath)}
        </Box>
      ))}

      {creates.length > 0 && (
        <>
          <Box marginTop={1}>
            {L("Create  ")}
            <Text color="green" bold>{String(creates.length)} file{creates.length !== 1 ? "s" : ""}</Text>
          </Box>
          {creates.map((r) => (
            <Box key={r.absolutePath} marginLeft={2}>
              <Text color="green">+  </Text>
              {I(r.relativePath)}
            </Box>
          ))}
        </>
      )}

      {plan.warnings.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          {plan.warnings.map((w, i) => (
            <Box key={i}>
              <Text color="yellow">⚠  </Text>
              <Text color="yellow">{w}</Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

function DryRunReportComponent({ plan }: { plan: CleanupPlan }) {
  useAutoExit();

  return (
    <Box flexDirection="column" marginTop={1} marginBottom={1}>
      <Box
        borderStyle="round"
        borderColor="blue"
        flexDirection="column"
        paddingX={2}
        paddingY={1}
        width={68}
      >
        <Box marginBottom={1} gap={2}>
          <Text color="blue" bold>Dry Run</Text>
          <Text dimColor>no changes will be made</Text>
        </Box>

        <Box marginBottom={1}>
          <Text color="blue" dimColor>{"─".repeat(62)}</Text>
        </Box>

        <FileList plan={plan} />
      </Box>
    </Box>
  );
}

function SuccessReportComponent({ plan }: { plan: CleanupPlan }) {
  useAutoExit();

  const deletions = plan.templateRemovals.length;
  const rewrites = plan.fileRewrites.length;

  return (
    <Box flexDirection="column" marginTop={1} marginBottom={1}>
      <Box
        borderStyle="round"
        borderColor="green"
        flexDirection="column"
        paddingX={2}
        paddingY={1}
        width={68}
      >
        <Box marginBottom={1}>
          <Text color="green" bold>✓ Done  </Text>
          <Text dimColor>
            deleted {String(deletions)} file{deletions !== 1 ? "s" : ""},
            {" "}rewrote {String(rewrites)} file{rewrites !== 1 ? "s" : ""}
          </Text>
        </Box>

        <Box marginBottom={1}>
          <Text color="green" dimColor>{"─".repeat(62)}</Text>
        </Box>

        <FileList plan={plan} />
      </Box>
    </Box>
  );
}

export async function renderDryRun(plan: CleanupPlan): Promise<void> {
  await renderAndWait(React.createElement(DryRunReportComponent, { plan }));
}

export async function renderSuccess(plan: CleanupPlan): Promise<void> {
  await renderAndWait(React.createElement(SuccessReportComponent, { plan }));
}

function ThemeCheckBannerComponent({ themePath, config }: { themePath: string; config: ThemeCheckConfig }) {
  useAutoExit();

  const configLabel = config.extends
    ? `${config.extends} · ${config.enabledChecks} checks enabled`
    : `default · ${config.enabledChecks} checks enabled`;

  return (
    <Box flexDirection="column" marginTop={1} marginBottom={1}>
      <Box
        borderStyle="round"
        borderColor="cyan"
        flexDirection="column"
        paddingX={2}
        paddingY={1}
        width={68}
      >
        <Box marginBottom={1} gap={2}>
          <Text color="cyan" bold>shopify theme check</Text>
          <Text dimColor>running…</Text>
        </Box>

        <Box marginBottom={1}>
          <Text color="cyan" dimColor>{"─".repeat(62)}</Text>
        </Box>

        <Box>
          <Text dimColor>Theme   </Text>
          <Text color="cyan">{themePath}</Text>
        </Box>
        <Box>
          <Text dimColor>Config  </Text>
          <Text dimColor>{configLabel}</Text>
        </Box>
      </Box>
    </Box>
  );
}

export async function renderThemeCheckBanner(themePath: string, config: ThemeCheckConfig): Promise<void> {
  await renderAndWait(React.createElement(ThemeCheckBannerComponent, { themePath, config }));
}

type CheckCount = { check: string; count: number };
type SeverityGroup = { severity: string; checks: CheckCount[]; total: number };

function groupBySeverity(results: ThemeCheckFileResult[]): SeverityGroup[] {
  const map = new Map<string, Map<string, number>>();
  for (const file of results) {
    for (const offense of file.offenses) {
      if (!map.has(offense.severity)) map.set(offense.severity, new Map());
      const byCheck = map.get(offense.severity)!;
      byCheck.set(offense.check, (byCheck.get(offense.check) ?? 0) + 1);
    }
  }
  return (["error", "warning", "info", "suggestion", "style"] as const)
    .filter((sev) => map.has(sev))
    .map((sev) => {
      const byCheck = map.get(sev)!;
      const checks = Array.from(byCheck.entries())
        .map(([check, count]) => ({ check, count }))
        .sort((a, b) => b.count - a.count);
      return { severity: sev, checks, total: checks.reduce((n, c) => n + c.count, 0) };
    });
}

function severityColor(severity: string): "red" | "yellow" | "blue" {
  if (severity === "error") return "red";
  if (severity === "warning") return "yellow";
  return "blue";
}

function ThemeCheckResultsComponent({ results }: { results: ThemeCheckFileResult[] }) {
  useAutoExit();

  const groups = groupBySeverity(results);
  const errorTotal = groups.find((g) => g.severity === "error")?.total ?? 0;
  const warningTotal = groups.find((g) => g.severity === "warning")?.total ?? 0;

  const borderColor = errorTotal > 0 ? "red" : warningTotal > 0 ? "yellow" : "green";

  const summaryParts: string[] = [];
  if (errorTotal > 0) summaryParts.push(`${errorTotal} error${errorTotal !== 1 ? "s" : ""}`);
  if (warningTotal > 0) summaryParts.push(`${warningTotal} warning${warningTotal !== 1 ? "s" : ""}`);
  const otherTotal = groups
    .filter((g) => g.severity !== "error" && g.severity !== "warning")
    .reduce((n, g) => n + g.total, 0);
  if (otherTotal > 0) summaryParts.push(`${otherTotal} other`);
  const summary = summaryParts.length > 0 ? summaryParts.join(" · ") : "no issues";

  return (
    <Box flexDirection="column" marginTop={1} marginBottom={1}>
      <Box
        borderStyle="round"
        borderColor={borderColor}
        flexDirection="column"
        paddingX={2}
        paddingY={1}
        width={68}
      >
        <Box marginBottom={groups.length > 0 ? 1 : 0} gap={2}>
          <Text color={borderColor} bold>shopify theme check</Text>
          <Text dimColor>{summary}</Text>
        </Box>

        {groups.length > 0 && (
          <>
            <Box marginBottom={1}>
              <Text color={borderColor} dimColor>{"─".repeat(62)}</Text>
            </Box>

            {groups.map((group, i) => (
              <Box key={group.severity} flexDirection="column" marginTop={i > 0 ? 1 : undefined}>
                <Text color={severityColor(group.severity)} bold>{group.severity}s</Text>
                {group.checks.map(({ check, count }) => (
                  <Box key={check} marginLeft={2}>
                    <Text dimColor>{check.padEnd(32)}</Text>
                    <Text>{String(count).padStart(3)}</Text>
                  </Box>
                ))}
              </Box>
            ))}

            <Box marginTop={1}>
              <Text dimColor>Run </Text>
              <Text>shopify theme check</Text>
              <Text dimColor> for full output</Text>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

export async function renderThemeCheckResults(results: ThemeCheckFileResult[]): Promise<void> {
  await renderAndWait(React.createElement(ThemeCheckResultsComponent, { results }));
}
