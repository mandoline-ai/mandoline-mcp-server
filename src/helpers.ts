import { createHash } from "crypto";

import { logger } from "./logger.js";

export function generateContentHash(prompt: string, response: string): string {
  const combined = prompt + response;
  const hash = createHash("sha256").update(combined, "utf8").digest("hex");
  return hash.substring(0, 8);
}

export function jsonToolResponse(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function handleToolError(error: unknown): never {
  const message =
    error instanceof Error ? error.message : String(error ?? "Unknown error");
  logger.error({ err: error }, "tool error");
  throw new Error(`Failed: ${message}`);
}
