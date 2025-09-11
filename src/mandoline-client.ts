import { Mandoline } from "mandoline";

import { logger } from "./logger.js";
import { requestContext } from "./server.js";

export function getMandolineClient() {
  const store = requestContext.getStore();
  const log = store ? logger.child({ requestId: store.requestId }) : logger;
  
  const apiKey = store?.apiKey;
  if (!apiKey) {
    log.error('Mandoline API key missing from request context');
    throw new Error("Mandoline API key missing.");
  }
  
  const mandoline = new Mandoline({ apiKey }); // MANDOLINE_API_BASE_URL inferred from env
  return mandoline;
}
