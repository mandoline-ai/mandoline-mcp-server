import { Mandoline } from "mandoline";

import { requestContext } from "./server.js";

export function getMandolineClient() {
  const store = requestContext.getStore();
  
  const apiKey = store?.apiKey;
  if (!apiKey) {
    throw new Error("Mandoline API key missing.");
  }
  
  const mandoline = new Mandoline({ apiKey }); // MANDOLINE_API_BASE_URL inferred from env
  return mandoline;
}
