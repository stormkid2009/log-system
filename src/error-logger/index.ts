import { createLogEntry } from "../log-entry";
import { safeAppendToLog  } from "../file-manager";
import { extractRequestData ,ApiRequestData} from "../request-utils";
import { LogLevel, ApiError } from "../types";


/**
 * Logs a general error to the log file without additional API context.
 */
export async function logError(message: string, error: Error): Promise<void> {
  const logEntry = createLogEntry(LogLevel.ERROR, message, {
    path: "unknown",
    method: "unknown",
    statusCode: 500,
    errorName: error.name,
    errorMessage: error.message,
    stack: error.stack,
  });

  await safeAppendToLog(JSON.stringify(logEntry));
}


