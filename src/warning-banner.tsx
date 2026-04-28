import React, { useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import figlet from "figlet";
import type { CleanupPlan } from "./types.js";

type Props = {
  plan: CleanupPlan;
  onConfirm: (confirmed: boolean) => void;
};

const WARNING_LINES = figlet
  .textSync("WARNING", { font: "Banner" })
  .split("\n")
  .filter((line) => line.trim() !== "");

function WarningBanner({ plan, onConfirm }: Props) {
  const { exit } = useApp();
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<"no" | "yes">("no");
  const [step, setStep] = useState<"first" | "second">("first");

  const deletions = plan.templateRemovals.length;
  const rewrites = plan.fileRewrites.filter((r) => !r.isNew);
  const creates = plan.fileRewrites.filter((r) => r.isNew);

  function confirm(value: boolean) {
    setAnswered(true);
    onConfirm(value);
    exit();
  }

  useInput((input, key) => {
    if (answered) return;

    if (key.leftArrow || key.rightArrow) {
      setSelected((s) => (s === "no" ? "yes" : "no"));
    } else if (key.return) {
      if (step === "first") {
        if (selected === "yes") {
          setStep("second");
          setSelected("no");
        } else {
          confirm(false);
        }
      } else {
        confirm(selected === "yes");
      }
    } else if (input.toLowerCase() === "y") {
      if (step === "first") {
        setStep("second");
        setSelected("no");
      } else {
        confirm(true);
      }
    } else if (input.toLowerCase() === "n" || key.escape) {
      confirm(false);
    }
  });

  return (
    <Box flexDirection="column" marginTop={1} marginBottom={1}>
      <Box
        borderStyle="bold"
        borderColor="red"
        flexDirection="column"
        paddingX={2}
        paddingY={1}
        width={68}
      >
        {/* Big ASCII art header */}
        <Box flexDirection="column" alignItems="center" marginBottom={1}>
          {WARNING_LINES.map((line, i) => (
            <Text key={i} color="red" bold>{line}</Text>
          ))}
        </Box>

        {/* Separator */}
        <Box marginBottom={1}>
          <Text color="red" dimColor>{"─".repeat(62)}</Text>
        </Box>

        {/* Theme path */}
        <Box marginBottom={1}>
          <Text color="white">Theme  </Text>
          <Text color="cyan">{plan.themePath}</Text>
        </Box>

        {/* Files to delete */}
        <Box>
          <Text color="white">Delete </Text>
          <Text color="red" bold>{String(deletions)} file{deletions !== 1 ? "s" : ""}</Text>
        </Box>
        {plan.templateRemovals.map((r) => (
          <Box key={r.absolutePath} marginLeft={2}>
            <Text color="red">✕  </Text>
            <Text color="white">{r.relativePath}</Text>
          </Box>
        ))}

        {/* Files to rewrite */}
        <Box marginTop={1}>
          <Text color="white">Rewrite </Text>
          <Text color="yellow" bold>{String(rewrites.length)} file{rewrites.length !== 1 ? "s" : ""}</Text>
        </Box>
        {rewrites.map((r) => (
          <Box key={r.absolutePath} marginLeft={2}>
            <Text color="yellow">↻  </Text>
            <Text color="white">{r.relativePath}</Text>
          </Box>
        ))}

        {/* Files to create */}
        {creates.length > 0 && (
          <>
            <Box marginTop={1}>
              <Text color="white">Create  </Text>
              <Text color="green" bold>{String(creates.length)} file{creates.length !== 1 ? "s" : ""}</Text>
            </Box>
            {creates.map((r) => (
              <Box key={r.absolutePath} marginLeft={2}>
                <Text color="green">+  </Text>
                <Text color="white">{r.relativePath}</Text>
              </Box>
            ))}
          </>
        )}

        {/* Warnings */}
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

      {/* Confirmation prompt */}
      <Box marginTop={1} gap={2}>
        <Text dimColor>{step === "first" ? "This cannot be undone. Apply these changes?" : "Are you sure?"}</Text>
        <Box gap={1}>
          {selected === "no" ? (
            <Text color="white" backgroundColor="red" bold> ❯ NO </Text>
          ) : (
            <Text color="gray">   NO </Text>
          )}
          {selected === "yes" ? (
            <Text color="white" backgroundColor="green" bold> ❯ YES </Text>
          ) : (
            <Text color="gray">   YES </Text>
          )}
        </Box>
        <Text dimColor>← →  enter</Text>
      </Box>
    </Box>
  );
}

export { WarningBanner };
