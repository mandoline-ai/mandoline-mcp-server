import { jsonToolResponse } from '../helpers.js';
import { server } from '../server.js';
import { TOOL_DESCRIPTIONS } from './descriptions.js';
import { HEALTH_RESPONSE } from '../constants.js';

server.registerTool(
  'get_server_health',
  {
    description: TOOL_DESCRIPTIONS.get_server_health,
    inputSchema: {},
  },
  async () => {
    return jsonToolResponse(HEALTH_RESPONSE);
  }
);
