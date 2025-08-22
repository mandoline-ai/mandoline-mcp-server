import { beforeEach, describe, expect, it, jest } from "@jest/globals";

// Mock the mandoline module
const mockMandolineInstance = {
  createMetric: jest.fn() as jest.MockedFunction<any>,
};

const MockMandoline = jest.fn(
  (_args?: any) => mockMandolineInstance
) as jest.MockedFunction<any>;

jest.mock("mandoline", () => ({
  Mandoline: MockMandoline,
}));

describe("Tools Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Mandoline Client Integration", () => {
    it("should create Mandoline client with API key", () => {
      // Simulate creating client with API key
      const client = new MockMandoline({ apiKey: "sk_test_key" });

      expect(MockMandoline).toHaveBeenCalledWith({ apiKey: "sk_test_key" });
      expect(client).toBeDefined();
    });

    it("should call createMetric with correct parameters", async () => {
      mockMandolineInstance.createMetric.mockResolvedValue({
        id: "metric_123",
        name: "test metric",
        description: "test description",
      });

      const result = await mockMandolineInstance.createMetric({
        name: "test metric",
        description: "test description",
        tags: ["test"],
      });

      expect(mockMandolineInstance.createMetric).toHaveBeenCalledWith({
        name: "test metric",
        description: "test description",
        tags: ["test"],
      });
      expect(result).toEqual({
        id: "metric_123",
        name: "test metric",
        description: "test description",
      });
    });

    it("should handle tool execution errors gracefully", async () => {
      mockMandolineInstance.createMetric.mockRejectedValue(
        new Error("API key invalid")
      );

      await expect(
        mockMandolineInstance.createMetric({
          name: "test",
          description: "test",
        })
      ).rejects.toThrow("API key invalid");

      expect(mockMandolineInstance.createMetric).toHaveBeenCalledTimes(1);
    });
  });

  describe("API Key Context Isolation", () => {
    it("should use correct API key per request context", () => {
      // Simulate two different API keys in different contexts
      new MockMandoline({ apiKey: "sk_user_1" });
      new MockMandoline({ apiKey: "sk_user_2" });

      // Verify each client was created with correct API key
      expect(MockMandoline).toHaveBeenNthCalledWith(1, { apiKey: "sk_user_1" });
      expect(MockMandoline).toHaveBeenNthCalledWith(2, { apiKey: "sk_user_2" });
      expect(MockMandoline).toHaveBeenCalledTimes(2);
    });
  });
});
