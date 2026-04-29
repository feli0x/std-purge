import React, { useState } from "react";
import { Box, Text, useApp, useInput, render } from "ink";
import { WarningBanner, YesNoSelector } from "./warning-banner.js";
import type { CleanupPlan } from "./types.js";

export async function confirmCleanup(plan: CleanupPlan): Promise<boolean> {
  return new Promise((resolve) => {
    const { unmount } = render(
      React.createElement(WarningBanner, {
        plan,
        onConfirm: (confirmed: boolean) => {
          unmount();
          resolve(confirmed);
        }
      })
    );
  });
}

function ThemeCheckPrompt({ onConfirm }: { onConfirm: (confirmed: boolean) => void }) {
  const { exit } = useApp();
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<"no" | "yes">("no");

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
      confirm(selected === "yes");
    } else if (input.toLowerCase() === "y") {
      confirm(true);
    } else if (input.toLowerCase() === "n" || key.escape) {
      confirm(false);
    }
  });

  return (
    <Box marginTop={1} gap={2}>
      <Text dimColor>Run shopify theme check?</Text>
      <YesNoSelector selected={selected} />
      <Text dimColor>← →  enter</Text>
    </Box>
  );
}

export async function confirmThemeCheck(): Promise<boolean> {
  let confirmed = false;
  const { waitUntilExit } = render(
    React.createElement(ThemeCheckPrompt, {
      onConfirm: (value: boolean) => {
        confirmed = value;
      }
    })
  );
  await waitUntilExit();
  return confirmed;
}
