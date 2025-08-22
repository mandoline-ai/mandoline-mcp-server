import { server } from "./server.js";

const LLMS_TXT_URI = "mandoline://llms.txt";

server.registerResource(
  "llms.txt",
  LLMS_TXT_URI,
  {
    name: "Mandoline llms.txt",
    description:
      "Index and overview of Mandoline's LLM evaluation platform documentation. Provides site navigation, key concepts summary, and links to detailed guides on creating custom metrics, API usage, and evaluation workflows.",
    mimeType: "text/plain",
  },
  async () => {
    try {
      const response = await fetch("https://mandoline.ai/llms.txt");
      const content = await response.text();
      return {
        contents: [
          {
            uri: LLMS_TXT_URI,
            mimeType: "text/plain",
            text: content,
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri: LLMS_TXT_URI,
            mimeType: "text/plain",
            text: `Error fetching llms.txt: ${error}.`,
          },
        ],
      };
    }
  }
);

const MCP_SERVER_DOCS_URI = "mandoline://mcp";

server.registerResource(
  "mcp",
  MCP_SERVER_DOCS_URI,
  {
    name: "Mandoline MCP Docs",
    description:
      "Documentation for Mandoline's Model Context Protocol (MCP) server integration. Covers MCP setup, configuration, available tools and resources, and how to integrate Mandoline's evaluation capabilities through the MCP interface.",
    mimeType: "text/plain",
  },
  async () => {
    try {
      const response = await fetch("https://mandoline.ai/mcp");
      const content = await response.text();
      return {
        contents: [
          {
            uri: MCP_SERVER_DOCS_URI,
            mimeType: "text/plain",
            text: content,
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri: MCP_SERVER_DOCS_URI,
            mimeType: "text/plain",
            text: `Error fetching MCP docs: ${error}.`,
          },
        ],
      };
    }
  }
);
