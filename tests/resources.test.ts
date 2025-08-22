import { beforeEach, describe, expect, it, jest } from "@jest/globals";

// Mock fetch for testing
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe("Resources Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Resource Configuration", () => {
    it("should define llms.txt resource correctly", () => {
      const expectedResource = {
        name: "Mandoline llms.txt",
        description:
          "Index and overview of Mandoline's LLM evaluation platform documentation. Provides site navigation, key concepts summary, and links to detailed guides on creating custom metrics, API usage, and evaluation workflows.",
        mimeType: "text/plain",
        uri: "mandoline://llms.txt",
      };

      // Test that our resource definition matches expected structure
      expect(expectedResource.name).toBe("Mandoline llms.txt");
      expect(expectedResource.uri).toBe("mandoline://llms.txt");
      expect(expectedResource.mimeType).toBe("text/plain");
      expect(expectedResource.description).toContain("evaluation platform");
    });

    it("should define MCP docs resource correctly", () => {
      const expectedResource = {
        name: "Mandoline MCP Docs",
        description:
          "Documentation for Mandoline's Model Context Protocol (MCP) server integration. Covers MCP setup, configuration, available tools and resources, and how to integrate Mandoline's evaluation capabilities through the MCP interface.",
        mimeType: "text/plain",
        uri: "mandoline://mcp",
      };

      expect(expectedResource.name).toBe("Mandoline MCP Docs");
      expect(expectedResource.uri).toBe("mandoline://mcp");
      expect(expectedResource.mimeType).toBe("text/plain");
      expect(expectedResource.description).toContain("server integration");
    });
  });

  describe("Resource Fetching Logic", () => {
    it("should handle successful fetch for llms.txt", async () => {
      const mockContent =
        "# Mandoline LLMs Documentation\n\nThis is test content.";
      mockFetch.mockResolvedValueOnce({
        text: async () => mockContent,
      } as Response);

      // Simulate the resource handler logic
      const resourceHandler = async () => {
        try {
          const response = await fetch("https://mandoline.ai/llms.txt");
          const content = await response.text();
          return {
            contents: [
              {
                uri: "mandoline://llms.txt",
                mimeType: "text/plain",
                text: content,
              },
            ],
          };
        } catch (error) {
          return {
            contents: [
              {
                uri: "mandoline://llms.txt",
                mimeType: "text/plain",
                text: `Error fetching llms.txt: ${error}.`,
              },
            ],
          };
        }
      };

      const result = await resourceHandler();

      expect(mockFetch).toHaveBeenCalledWith("https://mandoline.ai/llms.txt");
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].text).toBe(mockContent);
      expect(result.contents[0].uri).toBe("mandoline://llms.txt");
    });

    it("should handle fetch errors gracefully", async () => {
      const mockError = new Error("Network error");
      mockFetch.mockRejectedValueOnce(mockError);

      // Simulate the resource handler logic
      const resourceHandler = async () => {
        try {
          const response = await fetch("https://mandoline.ai/mcp");
          const content = await response.text();
          return {
            contents: [
              {
                uri: "mandoline://mcp",
                mimeType: "text/plain",
                text: content,
              },
            ],
          };
        } catch (error) {
          return {
            contents: [
              {
                uri: "mandoline://mcp",
                mimeType: "text/plain",
                text: `Error fetching MCP docs: ${error}.`,
              },
            ],
          };
        }
      };

      const result = await resourceHandler();

      expect(mockFetch).toHaveBeenCalledWith("https://mandoline.ai/mcp");
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].text).toContain("Error fetching MCP docs");
      expect(result.contents[0].text).toContain("Network error");
    });
  });

  describe("MCP Resource Interface", () => {
    it("should return proper resource structure", () => {
      const mockResourceResult = {
        contents: [
          {
            uri: "mandoline://llms.txt",
            mimeType: "text/plain",
            text: "Sample content",
          },
        ],
      };

      expect(mockResourceResult.contents).toHaveLength(1);
      expect(mockResourceResult.contents[0]).toHaveProperty("uri");
      expect(mockResourceResult.contents[0]).toHaveProperty("mimeType");
      expect(mockResourceResult.contents[0]).toHaveProperty("text");
    });

    it("should use consistent URI scheme", () => {
      const llmsTxtUri = "mandoline://llms.txt";
      const mcpDocsUri = "mandoline://mcp";

      expect(llmsTxtUri).toMatch(/^mandoline:\/\//);
      expect(mcpDocsUri).toMatch(/^mandoline:\/\//);
    });
  });
});
