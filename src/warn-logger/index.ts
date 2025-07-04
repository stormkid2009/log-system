import { createLogEntry } from "../log-entry";
import { safeAppendToLog  } from "../file-manager";
import { extractRequestData ,ApiRequestData} from "../request-utils";
import { LogLevel, ApiError } from "../types";



/**
 * Logs a warning message to the log file.
 */
export async function logWarn(
  message: string,
  details?: Record<string, unknown>
): Promise<void> {
  const logEntry = createLogEntry(LogLevel.WARN, message, details as any);
  await safeAppendToLog(JSON.stringify(logEntry));
}
