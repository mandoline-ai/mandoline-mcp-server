import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export const SESSION_TIMEOUT_MS = parseInt(process.env.SESSION_TIMEOUT_MS || "1800000"); // 30 minutes
export const SESSION_CLEANUP_INTERVAL_MS = parseInt(process.env.SESSION_CLEANUP_INTERVAL_MS || "300000"); // 5 minutes
