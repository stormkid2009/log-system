/**
 * Type Definitions Module
 *
 * Contains all type definitions, interfaces, and enums used throughout the logging system.
 * This serves as the single source of truth for all type-related information.
 *
 * @module types
 */

/**
 * Enum representing the severity levels for log entries.
 * These levels are used to categorize and filter log messages.
 *
 * @enum {string}
 * @readonly
 */
export enum LogLevel {
  /** Critical errors that cause the application to stop functioning */
  ERROR = "ERROR",
  /** General information about application progress and state */
  INFO = "INFO",
  /** Warnings about potential issues that don't prevent the application from working */
  WARN = "WARN",
  /** Debug information for development purposes */
  DEBUG = "DEBUG",
}

/**
 * Interface representing a structured API error.
 * Used to standardize error reporting throughout the application.
 *
 * @interface ApiError
 * @property {string} path - The API endpoint path where the error occurred
 * @property {string} method - The HTTP method of the request (e.g., 'GET', 'POST')
 * @property {number} statusCode - The HTTP status code of the error response
 * @property {string} errorName - The name/type of the error
 * @property {string} errorMessage - Human-readable error message
 * @property {string} [stack] - The error stack trace (if available)
 * @property {Object} [requestData] - Additional request context
 * @property {Record<string, string>} [requestData.query] - URL query parameters
 * @property {Record<string, string>} [requestData.params] - Route parameters
 * @property {Record<string, string>} [requestData.headers] - Request headers
 * @property {unknown} [requestData.body] - Request body
 */
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

/**
 * Interface representing a log entry in the system.
 *
 * @interface LogEntry
 * @property {string} timestamp - ISO 8601 timestamp of when the log was created
 * @property {LogLevel} level - The severity level of the log entry
 * @property {string} message - The main log message
 * @property {ApiError} [error] - Optional error details if this is an error log
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  error?: ApiError;
}

/**
 * Configuration options for the logger system.
 *
 * @interface LoggerConfig
 * @property {string} [logDir] - Directory where log files will be stored
 * @property {number} [maxLogSize] - Maximum size of log files in bytes before rotation
 * @property {number} [rotationInterval] - How often to check for log rotation (in milliseconds)
 * @property {'json'|'text'|'csv'} [format='json'] - Format for log entries
 * @property {Object} [formatOptions] - Options specific to the selected formatter
 * @property {boolean} [formatOptions.pretty] - Whether to pretty-print JSON (for 'json' format)
 * @property {number} [formatOptions.maxStackDepth] - Maximum stack trace depth to include
 * @property {boolean} [consoleOutput=false] - Whether to also log to console
 * @property {LogLevel} [minLevel=LogLevel.INFO] - Minimum log level to write
 */
export interface LoggerConfig {
  logDir?: string;
  logFilePath?: string;
  maxLogSize?: number;
  rotationInterval?: number;
  format?: "json" | "text" | "csv";
  formatOptions?: {
    pretty?: boolean;
    maxStackDepth?: number;
    [key: string]: any;
  };
  consoleOutput?: boolean;
  minLevel?: LogLevel;
}

/**
 * Enum representing possible log output destinations.
 *
 * @enum {string}
 * @readonly
 */
export enum LogDestination {
  /** Write logs to files */
  FILE = "file",
  /** Output logs to console */
  CONSOLE = "console",
  /** Send logs to a remote logging service */
  REMOTE = "remote",
}
