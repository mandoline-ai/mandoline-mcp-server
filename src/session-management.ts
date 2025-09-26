import { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { logger } from "./logger.js";
import { server } from "./server.js";
import { SESSION_TIMEOUT_MS, SESSION_CLEANUP_INTERVAL_MS } from "./env.js";

export interface SessionResult {
  transport: StreamableHTTPServerTransport;
  sid: string;
  isNewSession: boolean;
}

export interface SessionOptions {
  /**
   * When false, the session must already exist. Used for GET/DELETE requests where
   * the client is expected to provide an existing MCP session identifier.
   */
  createIfMissing?: boolean;
}

const transports = new Map<string, StreamableHTTPServerTransport>();
const sessionClientInfo = new Map<string, { name?: string; version?: string }>();
const sessionLastUsed = new Map<string, number>();

// Clean up expired sessions periodically
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [sid, lastUsed] of sessionLastUsed.entries()) {
    if (now - lastUsed > SESSION_TIMEOUT_MS) {
      transports.delete(sid);
      sessionClientInfo.delete(sid);
      sessionLastUsed.delete(sid);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    logger.debug({ cleanedCount }, "cleaned up expired sessions");
  }
}, SESSION_CLEANUP_INTERVAL_MS);

// Cleanup on process termination
process.on("SIGINT", () => {
  clearInterval(cleanupInterval);
  process.exit(0);
});

process.on("SIGTERM", () => {
  clearInterval(cleanupInterval);
  process.exit(0);
});

function makeTransport(id: string) {
  logger.debug({ sessionId: id }, "creating transport");
  return new StreamableHTTPServerTransport({ sessionIdGenerator: () => id });
}

export async function getOrCreateSession(
  req: Request,
  res: Response,
  log: typeof logger,
  options: SessionOptions = {}
): Promise<SessionResult | null> {
  const { createIfMissing = true } = options;
  const incomingSid = req.headers["mcp-session-id"] as string | undefined;
  let transport: StreamableHTTPServerTransport;
  let sid: string;
  let isNewSession = false;

  if (incomingSid) {
    if (transports.has(incomingSid)) {
      sid = incomingSid;
      transport = transports.get(sid)!;
      log.debug({ sid }, "re-using transport");
    } else {
      log.warn({ incomingSid }, "session not found");
      res
        .status(404)
        .json({
          jsonrpc: "2.0",
          error: {
            code: -32001,
            message: "Session not found",
          },
          id: null,
        });
      return null;
    }
  } else if (createIfMissing) {
    sid = randomUUID();
    transport = makeTransport(sid);
    transports.set(sid, transport);
    res.setHeader("Mcp-Session-Id", sid);
    isNewSession = true;

    try {
      await server.connect(transport);
      log.info({ sid }, "new session");
    } catch (err) {
      log.error({ err }, "connect failed");
      return null;
    }
  } else {
    log.warn("missing session id");
    res
      .status(400)
      .json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Bad Request: Mcp-Session-Id header is required",
        },
        id: null,
      });
    return null;
  }

  // Update last used timestamp
  sessionLastUsed.set(sid, Date.now());

  return { transport, sid, isNewSession };
}

export function validateAuthentication(
  req: Request,
  log: typeof logger
): string | null {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    log.warn("missing api key");
    return null;
  }
  return apiKey;
}

function getApiKey(req: Request): string | null {
  const key = req.headers["x-api-key"];
  if (typeof key === "string" && key.startsWith("sk_")) return key.trim();

  const auth = req.headers.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer sk_"))
    return auth.slice(7).trim();

  return null;
}

export function updateClientInfo(
  sid: string,
  req: Request,
  log: typeof logger
): void {
  if (!sessionClientInfo.has(sid)) {
    const body = req.body;
    if (
      body?.method === "initialize" &&
      typeof body.params?.clientInfo === "object"
    ) {
      sessionClientInfo.set(sid, body.params.clientInfo);
      log.debug({ sid, clientInfo: sessionClientInfo.get(sid) }, "client info set");
    }
  }
}

export async function handleTransportRequest(
  transport: StreamableHTTPServerTransport,
  req: Request,
  res: Response,
  sid: string,
  log: typeof logger
): Promise<void> {
  try {
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    log.error({ sid, err }, "request failed");
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export function getSessionClientInfo(sid: string) {
  return sessionClientInfo.get(sid);
}

// Test helpers
export function getSessionCount(): number {
  return transports.size;
}

export async function createTestSession(sid: string): Promise<void> {
  const transport = makeTransport(sid);
  transports.set(sid, transport);
  sessionLastUsed.set(sid, Date.now());
}

export function touchSession(sid: string): void {
  if (transports.has(sid)) {
    sessionLastUsed.set(sid, Date.now());
  }
}
