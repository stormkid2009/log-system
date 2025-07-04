// api-logger/index
import { createLogEntry } from "../log-entry";
import { safeAppendToLog } from "../file-manager";
import { extractRequestData, ApiRequestData } from "../request-utils";
import { LogLevel, ApiError } from "../types";

export async function logApiError(
  message: string,
  error: Error,
  context: {
    request?: ApiRequestData;
    path?: string;
    method?: string;
    statusCode: number;
    params?: Record<string, string>;
    requestBody?: unknown;
  },
): Promise<void> {
  // Implementation
  // Extract request data if request object is provided
  let requestData: any = {};

  if (context.request) {
    const extractedData = extractRequestData(context.request);
    requestData = {
      query: extractedData.query,
      headers: extractedData.headers,
    };

    // Use extracted path and method if not explicitly provided
    if (!context.path) context.path = extractedData.path;
    if (!context.method) context.method = extractedData.method;
  }

  // Add params and body if provided
  if (context.params) requestData.params = context.params;
  if (context.requestBody) requestData.body = context.requestBody;

  const logEntry = createLogEntry(LogLevel.ERROR, message, {
    path: context.path || "unknown",
    method: context.method || "unknown",
    statusCode: context.statusCode,
    errorName: error.name,
    errorMessage: error.message,
    stack: error.stack,
    requestData: Object.keys(requestData).length > 0 ? requestData : undefined,
  });
  await safeAppendToLog(JSON.stringify(logEntry));
}


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


/**
 * Logs an informational message to the log file.
 */
export async function logInfo(message: string): Promise<void> {
  const logEntry = createLogEntry(LogLevel.INFO, message);
  await safeAppendToLog(JSON.stringify(logEntry));
}


/**
 * Logs a warning message to the log file.
 */
export async function logWarn(
  message: string,
  details?: Record<string, unknown>,
): Promise<void> {
  const logEntry = createLogEntry(LogLevel.WARN, message, details as any);
  await safeAppendToLog(JSON.stringify(logEntry));
}

