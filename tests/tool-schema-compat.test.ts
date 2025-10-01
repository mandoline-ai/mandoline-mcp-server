import { describe, expect, it } from "@jest/globals";
import { zodToJsonSchema } from "zod-to-json-schema";

import {
  ContextAssetSchema,
  LooseRecordSchema,
  OutputAssetSchema,
  PromptSchema,
  ResponseSchema,
} from "../src/tools/schemas.js";

function collectAdditionalProperties(value: unknown, acc: unknown[] = []): unknown[] {
  if (Array.isArray(value)) {
    for (const entry of value) collectAdditionalProperties(entry, acc);
    return acc;
  }

  if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      if (key === "additionalProperties") acc.push(entry);
      collectAdditionalProperties(entry, acc);
    }
  }

  return acc;
}

function gatherSchemaAdditionalProperties(schema: unknown): unknown[] {
  return collectAdditionalProperties(schema, []);
}

describe("Tool schema JSON serialization", () => {
  it("only emits boolean additionalProperties", () => {
    const schemasToCheck = [
      zodToJsonSchema(LooseRecordSchema),
      zodToJsonSchema(ContextAssetSchema, { strictUnions: true }),
      zodToJsonSchema(OutputAssetSchema, { strictUnions: true }),
      zodToJsonSchema(PromptSchema, { strictUnions: true }),
      zodToJsonSchema(ResponseSchema, { strictUnions: true }),
    ];

    for (const schema of schemasToCheck) {
      const additions = gatherSchemaAdditionalProperties(schema);
      for (const value of additions) {
        expect(typeof value).toBe("boolean");
      }
    }
  });
});
