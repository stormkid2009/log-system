// log-entry/index.ts
// Core logging functionality

import { LogLevel, LogEntry, ApiError } from "../types";
import { safeAppendToLog } from "../file-manager";

// Create a log entry and write it to the log file
/**
export async function writeLog(
  level: LogLevel,
  message: string,
  error?: ApiError,
  logFilePath?: string
): Promise<void> {
  const entry = createLogEntry(level, message, error);
  await safeAppendToLog(entry, logFilePath);
}
*/
// Create a log entry object
export function createLogEntry(
  level: LogLevel,
  message: string,
  error?: ApiError,
): LogEntry {
  // Implementation
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    error: error && {
      ...error,
      // Limit stack trace depth for readability
      stack: error.stack?.split("\n").slice(0, 5).join("\n"),
    },
  };
}
