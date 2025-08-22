# Mandoline MCP Server

Enable AI assistants like Claude Code, Claude Desktop, and Cursor to reflect on, critique, and continuously improve their own performance using [Mandoline](https://mandoline.ai)'s evaluation framework via the [Model Context Protocol](https://modelcontextprotocol.io).

---

# Client Setup

**Most users should start here.** Use Mandoline's hosted MCP server to integrate evaluation tools into your AI assistant.

For each integration below, replace `sk_****` with your actual API key from [mandoline.ai/account](https://mandoline.ai/account).

## Claude Code

Use the CLI to add the Mandoline MCP server to Claude Code:

```bash
claude mcp add --scope user --transport http mandoline https://mandoline.ai/mcp --header "x-api-key: sk_****"
```

You can use `--scope user` (across projects) or `--scope project` (current project only).

**Note**: Restart any active Claude Code sessions after configuration changes.

**Verify**: Run `/mcp` in Claude Code to see Mandoline listed as an active server.

**Official Documentation**: [Claude Code MCP Guide](https://docs.anthropic.com/en/docs/claude-code/mcp)

## Claude Desktop

Edit your configuration file (**Settings > Developer > Edit Config**):

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "Mandoline": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mandoline.ai/mcp",
        "--header",
        "x-api-key: ${MANDOLINE_API_KEY}"
      ],
      "env": {
        "MANDOLINE_API_KEY": "sk_****"
      }
    }
  }
}
```

This configuration applies globally to all conversations.

**Note**: Restart Claude Desktop after configuration changes.

**Verify**: Look for Mandoline tools when you click the "Search and tools" button.

**Official Documentation**: [MCP Quickstart Guide](https://modelcontextprotocol.io/quickstart)

## Cursor

Create or edit your MCP configuration file:

```json
{
  "mcpServers": {
    "Mandoline": {
      "url": "https://mandoline.ai/mcp",
      "headers": {
        "x-api-key": "sk_****"
      }
    }
  }
}
```

You can use your global configuration (affects all projects) `~/.cursor/mcp.json` or project-local configuration (current project only) `.cursor/mcp.json` (in project root)

**Note**: Restart Cursor after configuration changes.

**Verify**: Check the Output panel (Ctrl+Shift+U) → "MCP Logs" for successful connection, or look for Mandoline tools in the Composer Agent.

**Official Documentation**: [Cursor MCP Guide](https://docs.cursor.com/context/model-context-protocol)

---

# Server Setup

**Only needed if you want to run the server locally or contribute to development.** Most users should use the hosted server above.

**Prerequisites:** Node.js 18+ and npm

## Installation

1. **Clone and build**

   ```bash
   git clone https://github.com/mandoline-ai/mandoline-mcp-server.git
   cd mandoline-mcp-server
   npm install
   npm run build
   ```

2. **Configure environment (optional)**

   ```bash
   cp .env.example .env.local
   # Edit .env.local to customize PORT, LOG_LEVEL, etc.
   ```

3. **Start the server**
   ```bash
   npm start
   ```

The server runs on `http://localhost:8080` by default.

## Using Local Server

To use your local server instead of the hosted one, replace `https://mandoline.ai/mcp` with `http://localhost:8080/mcp` in the client configurations above.

---

# Usage

Once integrated, you can use Mandoline evaluation tools directly in your AI assistant conversations.

## Tools

## Metrics

| Tool                   | Purpose                                                   |
| ---------------------- | --------------------------------------------------------- |
| `create_metric`        | Define custom evaluation criteria for your specific tasks |
| `batch_create_metrics` | Create multiple evaluation metrics in one operation       |
| `get_metric`           | Retrieve details about a specific metric                  |
| `get_metrics`          | Browse your metrics with filtering and pagination         |
| `update_metric`        | Modify existing metric definitions                        |

## Evaluations

| Tool                       | Purpose                                                 |
| -------------------------- | ------------------------------------------------------- |
| `create_evaluation`        | Score prompt/response pairs against your metrics        |
| `batch_create_evaluations` | Evaluate the same content against multiple metrics      |
| `get_evaluation`           | Retrieve evaluation results and scores                  |
| `get_evaluations`          | Browse evaluation history with filtering and pagination |
| `update_evaluation`        | Add metadata or context to evaluations                  |

## Resources

Access Mandoline's documentation and reference materials directly in your AI assistant, including model comparison guides and evaluation best practices.

---

# Support

- **Platform**: [https://mandoline.ai](https://mandoline.ai) - Create account and get API keys
- **Documentation**: [https://mandoline.ai/docs](https://mandoline.ai/docs) - Evaluation guides and best practices
- **Issues**: [GitHub Issues](https://github.com/mandoline-ai/mandoline-mcp-server/issues) - Bug reports and feature requests
- **Email**: support@mandoline.ai - Direct support

---

# License

Apache-2.0 License - see the [LICENSE](LICENSE) file for details.
