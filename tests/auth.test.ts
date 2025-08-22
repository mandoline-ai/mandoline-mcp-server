import { describe, expect, it } from "@jest/globals";

// Simple API key extraction function (isolated from server for testing)
function getApiKey(
  headers: Record<string, string | string[] | undefined>
): string | null {
  const key = headers["x-api-key"];
  if (typeof key === "string" && key.trim().startsWith("sk_"))
    return key.trim();

  const auth = headers.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer sk_"))
    return auth.slice(7).trim();

  return null;
}

describe("Authentication Tests", () => {
  describe("API Key Extraction Logic", () => {
    it("should extract valid API key from X-API-KEY header", () => {
      const headers = { "x-api-key": "sk_test_key_123" };
      const result = getApiKey(headers);
      expect(result).toBe("sk_test_key_123");
    });

    it("should extract valid API key from Authorization Bearer header", () => {
      const headers = { authorization: "Bearer sk_test_key_456" };
      const result = getApiKey(headers);
      expect(result).toBe("sk_test_key_456");
    });

    it("should return null for missing API key", () => {
      const headers = {};
      const result = getApiKey(headers);
      expect(result).toBe(null);
    });

    it("should return null for API key without sk_ prefix", () => {
      const headers = { "x-api-key": "invalid_key_123" };
      const result = getApiKey(headers);
      expect(result).toBe(null);
    });

    it("should return null for malformed Authorization header", () => {
      const headers = { authorization: "Bearer invalid_key" };
      const result = getApiKey(headers);
      expect(result).toBe(null);
    });

    it("should handle array header values", () => {
      const headers = { "x-api-key": ["sk_test_key_789"] };
      const result = getApiKey(headers);
      expect(result).toBe(null); // Should only handle string values
    });

    it("should trim whitespace from API key", () => {
      const headers = { "x-api-key": "  sk_test_key_trimmed  " };
      const result = getApiKey(headers);
      expect(result).toBe("sk_test_key_trimmed");
    });
  });
});
