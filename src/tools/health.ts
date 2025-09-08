import { handleToolError, jsonToolResponse } from '../helpers.js';
import { server, serverConfig } from '../server.js';
import { TOOL_DESCRIPTIONS } from './descriptions.js';

server.registerTool(
  'get_server_health',
  {
    description: TOOL_DESCRIPTIONS.get_server_health,
    inputSchema: {},
  },
  async () => {
    try {
      const healthStatus = {
        ...serverConfig,
        ok: true,
        timestamp: new Date().toISOString(),
      };
      return jsonToolResponse(healthStatus);
    } catch (error) {
      handleToolError(error);
    }
  }
);