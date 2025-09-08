#!/usr/bin/env node

import "./env.js";

import { readFileSync } from "fs";
import path from "path";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { AsyncLocalStorage } from "node:async_hooks";

import { httpLogger, logger } from "./logger.js";
import {
  getOrCreateSession,
  validateAuthentication,
  updateClientInfo,
  handleTransportRequest,
  getSessionClientInfo,
} from "./session-management.js";
import { HEALTH_RESPONSE } from "./constants.js";

export const serverConfig = {
  name: "mandoline-mcp-server",
  title: "Mandoline",
  version: "0.2.0",
};

export const server = new McpServer(serverConfig);


interface ReqStore {
  apiKey: string;
  clientInfo?: { name?: string; version?: string };
  requestId: string;
}

export const requestContext = new AsyncLocalStorage<ReqStore>();

const app = express();
app.use(express.json({ limit: "16mb" }));
app.use(httpLogger());

app.use(
  cors({
    origin: ["https://mandoline.ai", "http://localhost:3000"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-API-KEY",
      "MCP-Protocol-Version",
      "MCP-Session-Id",
    ],
    credentials: true,
  })
);


const readmeText = readFileSync(
  path.resolve(process.cwd(), "README.md"),
  "utf8"
);

app.get("/health", (_req, res) => res.json(HEALTH_RESPONSE));

app.get("/mcp", (_req, res) =>
  res.type("text/plain; charset=utf-8").send(readmeText)
);

app.post("/mcp", async (req: Request, res: Response) => {
  const requestId = (req as any).id as string;
  const log = logger.child({ requestId });

  log.debug("request in");

  const apiKey = validateAuthentication(req, log);
  if (!apiKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const sessionResult = await getOrCreateSession(req, res, log);
  if (!sessionResult) {
    return res.status(500).json({ error: "Internal server error" });
  }

  const { transport, sid } = sessionResult;

  (req as any).mcpSid = sid;

  updateClientInfo(sid, req, log);

  await requestContext.run(
    { apiKey, clientInfo: getSessionClientInfo(sid), requestId },
    async () => {
      await handleTransportRequest(transport, req, res, sid, log);
    }
  );
});

app.use(
  (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
  ) => {
    logger.error({ err }, "unhandled");
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

async function main() {
  try {
    logger.info("loading tools…");
    await import("./tools/metrics.js");
    await import("./tools/evaluations.js");
    await import("./tools/health.js");
    await import("./resources.js");

    const PORT = process.env.PORT ?? 8080;
    app.listen(PORT, () => logger.info(`server on ${PORT}`));
  } catch (err) {
    logger.fatal({ err }, "startup failed");
    process.exit(1);
  }
}

main();
