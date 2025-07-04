// info-logger/index.ts
import { createLogEntry } from "../log-entry";
import { safeAppendToLog } from "../file-manager";
import { LogLevel } from "../types";

/**
 * Logs an informational message to the log file.
 */
export async function logInfo(message: string): Promise<void> {
  const logEntry = createLogEntry(LogLevel.INFO, message);
  await safeAppendToLog(JSON.stringify(logEntry));
}
