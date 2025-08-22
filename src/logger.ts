import type { IncomingMessage, ServerResponse } from "http";

import type { Request, RequestHandler, Response } from "express";
import type { Logger, LoggerOptions } from "pino";
import { pino as createLogger } from "pino";
import pinoHttp from "pino-http";

/**
 * Central application logger
 */
const levelFromEnv =
  process.env.LOG_LEVEL ??
  (process.env.NODE_ENV === "production" ? "info" : "debug");

const opts: LoggerOptions = {
  level: levelFromEnv,
  timestamp: () => `,"time":"${new Date().toISOString()}"`,

  redact: {
    paths: [
      'req.headers["x-api-key"]',
      "req.headers.authorization",
      "req.headers.cookie",
      'req.headers["set-cookie"]',
      'res.headers["set-cookie"]',
    ],
    remove: true,
  },

  formatters: {
    level(label) {
      return { level: label };
    },
    bindings() {
      return {};
    },
  },

  ...//process.env.NODE_ENV !== "production" &&
  (process.stdout.isTTY && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "yyyy-mm-dd HH:MM:ss.l",
        ignore: "pid,hostname",
      },
    },
  }),
};

export const logger: Logger = createLogger(opts);

/**
 * Build serializers whose verbosity depends on the active log level.
 */
function makeSerializers() {
  const compact = logger.levelVal >= logger.levels.values.info; // info | warn | error

  function reqSerializer(req: IncomingMessage & { body?: any }) {
    if (compact) {
      return {};
    }

    return {
      id: (req as any).id,
      method: req.method,
      url: (req as any).originalUrl ?? req.url,
      headers: {
        "user-agent": req.headers["user-agent"],
        "x-forwarded-for": req.headers["x-forwarded-for"],
      },
      remoteAddress: req.socket?.remoteAddress,
    };
  }

  function resSerializer(res: ServerResponse) {
    if (compact) return { statusCode: res.statusCode };
    return {
      statusCode: res.statusCode,
      headers: {
        "content-type": res.getHeader("content-type"),
        "mcp-session-id": res.getHeader("mcp-session-id"),
      },
    };
  }

  return { req: reqSerializer, res: resSerializer };
}

/**
 * Extract a terse summary we always place at top-level.
 */
function summary(req: Request, res: Response) {
  return {
    sid: (req as any).mcpSid ?? req.headers["mcp-session-id"],
    rpc_method: req.body?.method,
    tool: req.body?.params?.name,
    status: res.statusCode,
  };
}

/**
 * Express middleware for request/response logging.
 *
 *  • success (<400)  → debug / info (compact)
 *  • client error    → warn
 *  • server error    → error
 */
export function httpLogger(): RequestHandler {
  return (pinoHttp as unknown as (opts: any) => RequestHandler)({
    logger,
    serializers: makeSerializers(),

    customLogLevel(_req: Request, res: Response, err?: Error) {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return logger.levelVal <= logger.levels.values.debug ? "debug" : "info";
    },

    customSuccessMessage: () => "request done",
    customSuccessObject: summary,

    autoLogging: { ignore: () => false },
  });
}
