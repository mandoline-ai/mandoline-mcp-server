import { jsonToolResponse } from '../helpers.js';
import { server } from '../server.js';
import { TOOL_DESCRIPTIONS } from './descriptions.js';

server.registerTool(
  'get_server_health',
  {
    description: TOOL_DESCRIPTIONS.get_server_health,
    inputSchema: {},
  },
  async () => {
    return jsonToolResponse({ status: 'ok' });
  }
);
