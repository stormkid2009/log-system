/**
 * Logger Module
 *
 * Provides a centralized logging system for API requests, errors, and general application logging.
 * Handles different log levels (ERROR, WARN, INFO) and formats log entries with relevant context.
 *
 * @module logger
 */

import { createLogEntry } from "../log-entry";
import { safeAppendToLog } from "../file-manager";
import { extractRequestData, ApiRequestData } from "../request-utils";
import { LogLevel, ApiError, LoggerConfig } from "../types";
import { createFormatter } from "../custom-format";

// Global logger config (default)
let globalLoggerConfig: LoggerConfig = {
  format: "json",
  formatOptions: {},
  consoleOutput: false,
};

export function setLoggerConfig(config: Partial<LoggerConfig>) {
  globalLoggerConfig = { ...globalLoggerConfig, ...config };
}

export function getLoggerConfig(): LoggerConfig {
  return { ...globalLoggerConfig };
}

function getFormatter(config?: LoggerConfig) {
  const cfg = config || globalLoggerConfig;
  return createFormatter(cfg.format || "json", cfg.formatOptions || {});
}

async function writeLog(formatted: string, config?: LoggerConfig) {
  // Write to file
  await safeAppendToLog(formatted);
  // Optionally output to console
  if ((config || globalLoggerConfig).consoleOutput) {
    // Remove trailing newline for console
    console.log(formatted.trim());
  }
}

/**
 * Logs an API-related error with detailed request context.
 * Extracts and includes request data, parameters, and error details in the log entry.
 *
 * @async
 * @param {string} message - The main error message
 * @param {Error} error - The error object that was thrown
 * @param {Object} context - Contextual information about the API request
 * @param {ApiRequestData} [context.request] - The HTTP request object
 * @param {string} [context.path] - The API endpoint path
 * @param {string} [context.method] - The HTTP method (GET, POST, etc.)
 * @param {number} context.statusCode - The HTTP status code
 * @param {Object.<string, string>} [context.params] - URL parameters
 * @param {unknown} [context.requestBody] - The request body
 *
 * @example
 * try {
 *   // API handler code
 * } catch (error) {
 *   await logApiError('Failed to process request', error, {
 *     request: req,
 *     statusCode: 500,
 *     params: { id: '123' }
 *   });
 * }
 */
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
  configOverride?: Partial<LoggerConfig>
): Promise<void> {
  let requestData: any = {};
  if (context.request) {
    const extractedData = extractRequestData(context.request);
    requestData = {
      query: extractedData.query,
      headers: extractedData.headers,
    };
    if (!context.path) context.path = extractedData.path;
    if (!context.method) context.method = extractedData.method;
  }
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
  const config = { ...globalLoggerConfig, ...configOverride };
  const formatter = getFormatter(config);
  await writeLog(formatter.format(logEntry), config);
}

/**
 * Logs a general application error to the log file.
 * Use this for non-API related errors or when request context is not available.
 *
 * @async
 * @param {string} message - The error message
 * @param {Error} error - The error object that was thrown
 *
 * @example
 * try {
 *   // Some operation that might throw
 * } catch (error) {
 *   await logError('Failed to process data', error);
 * }
 */
export async function logError(
  message: string,
  error: Error,
  configOverride?: Partial<LoggerConfig>
): Promise<void> {
  const logEntry = createLogEntry(LogLevel.ERROR, message, {
    path: "unknown",
    method: "unknown",
    statusCode: 500,
    errorName: error.name,
    errorMessage: error.message,
    stack: error.stack,
  });
  const config = { ...globalLoggerConfig, ...configOverride };
  const formatter = getFormatter(config);
  await writeLog(formatter.format(logEntry), config);
}

/**
 * Logs an informational message to the log file.
 * Use this for general application events and state changes.
 *
 * @async
 * @param {string} message - The informational message to log
 *
 * @example
 * await logInfo('Application started successfully');
 */
export async function logInfo(
  message: string,
  configOverride?: Partial<LoggerConfig>
): Promise<void> {
  const logEntry = createLogEntry(LogLevel.INFO, message);
  const config = { ...globalLoggerConfig, ...configOverride };
  const formatter = getFormatter(config);
  await writeLog(formatter.format(logEntry), config);
}

/**
 * Logs a warning message to the log file.
 * Use this for non-critical issues that should be investigated.
 *
 * @async
 * @param {string} message - The warning message
 * @param {Object} [details] - Additional details about the warning
 *
 * @example
 * await logWarn('Resource usage approaching threshold', { usage: '85%' });
 */
export async function logWarn(
  message: string,
  details?: Record<string, unknown>,
  configOverride?: Partial<LoggerConfig>
): Promise<void> {
  const logEntry = createLogEntry(LogLevel.WARN, message, details as any);
  const config = { ...globalLoggerConfig, ...configOverride };
  const formatter = getFormatter(config);
  await writeLog(formatter.format(logEntry), config);
}
