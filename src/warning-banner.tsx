import React, { useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import figlet from "figlet";
import { FileList } from "./plan-report.js";
import type { CleanupPlan } from "./types.js";

type Props = {
  plan: CleanupPlan;
  onConfirm: (confirmed: boolean) => void;
};

const WARNING_LINES = figlet
  .textSync("WARNING", { font: "Banner" })
  .split("\n")
  .filter((line) => line.trim() !== "");

export function YesNoSelector({ selected }: { selected: "no" | "yes" }) {
  return (
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
  );
}

function WarningBanner({ plan, onConfirm }: Props) {
  const { exit } = useApp();
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<"no" | "yes">("no");
  const [step, setStep] = useState<"first" | "second">("first");

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
        <Box flexDirection="column" alignItems="center" marginBottom={1}>
          {WARNING_LINES.map((line, i) => (
            <Text key={i} color="red" bold>{line}</Text>
          ))}
        </Box>

        <Box marginBottom={1}>
          <Text color="red" dimColor>{"─".repeat(62)}</Text>
        </Box>

        <FileList plan={plan} bright />
      </Box>

      <Box marginTop={1} gap={2}>
        <Text dimColor>{step === "first" ? "This cannot be undone. Apply these changes?" : "Are you sure?"}</Text>
        <YesNoSelector selected={selected} />
        <Text dimColor>← →  enter</Text>
      </Box>
    </Box>
  );
}

export { WarningBanner };
