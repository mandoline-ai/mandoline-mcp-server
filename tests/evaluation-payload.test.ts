import { describe, expect, it } from "@jest/globals";
import { PromptSchema, ResponseSchema } from "../src/tools/schemas";

describe("Evaluation Payload Schema Tests", () => {
  const samplePromptObject = {
    messages: [
      { role: "user" as const, content: "What is 2+2?" },
      { role: "assistant" as const, content: "4" },
    ],
    context_assets: [],
    invocations: [],
  };

  const sampleResponseObject = {
    message: { role: "assistant" as const, content: "The answer is 4." },
    output_assets: [],
    invocations: [],
  };

  describe("PromptSchema", () => {
    it("should accept object input", () => {
      expect(() => PromptSchema.parse(samplePromptObject)).not.toThrow();
    });

    it("should reject string input", () => {
      const promptString = JSON.stringify(samplePromptObject);
      expect(() => PromptSchema.parse(promptString)).toThrow();
    });

    it("should validate required fields", () => {
      expect(() => PromptSchema.parse({})).toThrow();
      expect(() => PromptSchema.parse({ messages: [] })).not.toThrow(); // Empty array allowed by schema
    });
  });

  describe("ResponseSchema", () => {
    it("should accept object input", () => {
      expect(() => ResponseSchema.parse(sampleResponseObject)).not.toThrow();
    });

    it("should reject string input", () => {
      const responseString = JSON.stringify(sampleResponseObject);
      expect(() => ResponseSchema.parse(responseString)).toThrow();
    });

    it("should validate required fields", () => {
      expect(() => ResponseSchema.parse({})).toThrow();
      expect(() => ResponseSchema.parse({ message: { role: "user", content: "test" } })).not.toThrow(); // Role validation happens in model validation
    });
  });

  describe("Schema Implementation", () => {
    it("should have built schemas available", () => {
      const fs = require("fs");
      expect(fs.existsSync("./dist/tools/schemas.js")).toBe(true);
    });

    it("should use direct object schemas", () => {
      const fs = require("fs");
      const schemaSource = fs.readFileSync("./src/tools/schemas.ts", "utf8");
      
      expect(schemaSource).toContain("export const PromptSchema = z.object");
      expect(schemaSource).toContain("export const ResponseSchema = z.object");
    });
  });
});