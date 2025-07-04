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
