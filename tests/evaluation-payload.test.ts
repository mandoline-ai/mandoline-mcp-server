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

    it("should accept string input", () => {
      const promptString = JSON.stringify(samplePromptObject);
      expect(() => PromptSchema.parse(promptString)).not.toThrow();
    });

    it("should produce equivalent results for string and object inputs", () => {
      const promptString = JSON.stringify(samplePromptObject);
      
      const objectResult = PromptSchema.parse(samplePromptObject);
      const stringResult = PromptSchema.parse(promptString);
      
      expect(stringResult).toEqual(objectResult);
    });
  });

  describe("ResponseSchema", () => {
    it("should accept object input", () => {
      expect(() => ResponseSchema.parse(sampleResponseObject)).not.toThrow();
    });

    it("should accept string input", () => {
      const responseString = JSON.stringify(sampleResponseObject);
      expect(() => ResponseSchema.parse(responseString)).not.toThrow();
    });

    it("should produce equivalent results for string and object inputs", () => {
      const responseString = JSON.stringify(sampleResponseObject);
      
      const objectResult = ResponseSchema.parse(sampleResponseObject);
      const stringResult = ResponseSchema.parse(responseString);
      
      expect(stringResult).toEqual(objectResult);
    });
  });

  describe("Schema Implementation", () => {
    it("should have built schemas available", () => {
      const fs = require("fs");
      expect(fs.existsSync("./dist/tools/schemas.js")).toBe(true);
    });

    it("should use union types for MCP compatibility", () => {
      const fs = require("fs");
      const schemaSource = fs.readFileSync("./src/tools/schemas.ts", "utf8");
      
      expect(schemaSource).toContain(".union([z.string(), BasePromptSchema])");
      expect(schemaSource).toContain(".union([z.string(), BaseResponseSchema])");
    });
  });
});