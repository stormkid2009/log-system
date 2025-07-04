// types.ts : Done
/*
export enum LogLevel {
  ERROR = "ERROR",
  INFO = "INFO",
  WARN = "WARN",
  DEBUG = "DEBUG",
}

export interface ApiError {
  path: string;
  method: string;
  statusCode: number;
  errorName: string;
  errorMessage: string;
  stack?: string;
  requestData?: {
    query?: Record<string, string>;
    params?: Record<string, string>;
    headers?: Record<string, string>;
    body?: unknown;
  };
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  error?: ApiError;
}





// config.ts : Done
import path from "path";

export const DEFAULT_CONFIG = {
  LOG_DIR: path.resolve("logs"),
  LOG_FILE_PATH: path.join(path.resolve("logs"), "api-errors.log"),
  MAX_LOG_SIZE: Number(process.env.MAX_LOG_SIZE) || 10 * 1024 * 1024, // 10MB default
  ROTATION_CHECK_INTERVAL: 1000 * 60 * 5, // Check rotation every 5 minutes
};



// file-manager.ts  Done with file manager
import fs from "fs/promises";
import path from "path";
import { DEFAULT_CONFIG } from "./config";

// Track last log rotation check and maintain a write queue for sequential file writes
let lastRotationCheck = Date.now();
let writeQueue: Promise<void> = Promise.resolve();

// FOR TESTING PURPOSES
export function _setLastRotationCheck(value: number) {
  lastRotationCheck = value;
}

export { lastRotationCheck, writeQueue };

/**
 * Ensures that the log directory exists.
 

export async function ensureLogDirectory(
  logDir = DEFAULT_CONFIG.LOG_DIR
): Promise<void> {
  try {
    await fs.mkdir(logDir, { recursive: true });
  } catch (error) {
    console.error("Failed to create logs directory:", error);
  }
}

/**
 * Rotates the log file if it exceeds the maximum allowed size.
 
export async function rotateLogFile(
  logFilePath = DEFAULT_CONFIG.LOG_FILE_PATH,
  maxSize = DEFAULT_CONFIG.MAX_LOG_SIZE
): Promise<void> {
  const now = new Date();
  try {
    const stats = await fs.stat(logFilePath).catch(() => null);

    if (stats && stats.size >= maxSize) {
      const dir = path.dirname(logFilePath);
      const ext = path.extname(logFilePath);
      const base = path.basename(logFilePath, ext);
      const timestamp = now.toISOString().replace(/[:.]/g, "-");
      const newPath = path.join(dir, `${base}-${timestamp}${ext}`);
      await fs.rename(logFilePath, newPath);
    }
  } catch (error) {
    console.error("Log rotation failed:", error);
  }
}

/**
 * Safely appends the provided log data to the log file.
 
export async function safeAppendToLog(
  data: string,
  logFilePath = DEFAULT_CONFIG.LOG_FILE_PATH
): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    try {
      const logDir = path.dirname(logFilePath);
      await ensureLogDirectory(logDir);

      // Check log rotation interval
      if (
        Date.now() - lastRotationCheck >
        DEFAULT_CONFIG.ROTATION_CHECK_INTERVAL
      ) {
        await rotateLogFile(logFilePath);
        lastRotationCheck = Date.now();
      }

      // Append the data to the log file
      await fs.appendFile(logFilePath, data + "\n", "utf8");
    } catch (error) {
      console.error("Failed to write to log file:", error);
    }
  });

  return writeQueue;
}
*/

// request-utils.ts  Done with request data extraction
import { NextRequest } from "next/server";

/**
 * Extracts relevant information from a NextRequest or Request object.
 
export function extractRequestData(request: NextRequest | Request) {
  try {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    // Extract headers (limited set for security/privacy)
    const headers: Record<string, string> = {};
    const importantHeaders = [
      "content-type",
      "user-agent",
      "referer",
      "x-request-id",
      "x-correlation-id",
      "x-forwarded-for",
    ];

    request.headers.forEach((value, key) => {
      if (importantHeaders.includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    // Extract search params
    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    return {
      path,
      method,
      headers,
      query,
    };
  } catch (error) {
    console.error("Failed to extract request data:", error);
    return {
      path: "unknown",
      method: "unknown",
      headers: {},
      query: {},
    };
  }
}
*/
// log-entry.ts     **Done with log entry file**
import { LogLevel, LogEntry, ApiError } from "./types";

/**
 * Creates a log entry object with the given level, message, and optional error data.
 
export function createLogEntry(
  level: LogLevel,
  message: string,
  error?: ApiError
): LogEntry {
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
*/
// logger.ts
import { NextRequest } from "next/server";
import { LogLevel, ApiError } from "./types";
import { createLogEntry } from "./log-entry";
import { safeAppendToLog } from "./file-manager";
import { extractRequestData } from "./request-utils";

/** Done with API error logging
 * Logs an API error with context details to the log file.
 
export async function logApiError(
  message: string,
  error: Error,
  context: {
    request?: NextRequest | Request;
    path?: string;
    method?: string;
    statusCode: number;
    params?: Record<string, string>;
    requestBody?: unknown;
  }
): Promise<void> {
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

/**     Done with error logging
 * Logs a general error to the log file without additional API context.
 
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
*/
/**  Done with info logging
 * Logs an informational message to the log file.
 
export async function logInfo(message: string): Promise<void> {
  const logEntry = createLogEntry(LogLevel.INFO, message);
  await safeAppendToLog(JSON.stringify(logEntry));
}

/**   Done with warning logging
 * Logs a warning message to the log file.
 
export async function logWarn(
  message: string,
  details?: Record<string, unknown>
): Promise<void> {
  const logEntry = createLogEntry(LogLevel.WARN, message, details as any);
  await safeAppendToLog(JSON.stringify(logEntry));
}
*/
// index.ts - Main export file
export { LogLevel } from "./types";
export type { ApiError, LogEntry } from "./types";
export { logApiError, logError, logInfo, logWarn } from "./logger";
export { _setLastRotationCheck } from "./file-manager";
export { DEFAULT_CONFIG } from "./config";

// Re-export utility functions for advanced usage
export { createLogEntry } from "./log-entry";
export { extractRequestData } from "./request-utils";
export {
  safeAppendToLog,
  ensureLogDirectory,
  rotateLogFile,
} from "./file-manager";
