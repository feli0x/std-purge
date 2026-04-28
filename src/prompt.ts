import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export async function confirmCleanup(): Promise<boolean> {
  const readline = createInterface({ input, output });

  try {
    const answer = await readline.question("Apply these cleanup changes? [y/N] ");
    return ["y", "yes"].includes(answer.trim().toLowerCase());
  } finally {
    readline.close();
  }
}
