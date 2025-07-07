/**
 * Log Entry Module
 *
 * Handles the creation and formatting of log entries in the application.
 * Provides functionality to create structured log entries with proper error handling
 * and formatting for consistent logging throughout the application.
 *
 * @module log-entry
 */

import { LogLevel, LogEntry, ApiError } from "../types";

/**
 * Creates a structured log entry with the provided parameters.
 * Formats the log entry with a timestamp, log level, message, and optional error details.
 *
 * @param {LogLevel} level - The severity level of the log entry
 * @param {string} message - The main log message
 * @param {ApiError} [error] - Optional error object to include in the log entry
 * @returns {LogEntry} A structured log entry object
 *
 * @example
 * // Basic usage
 * const entry = createLogEntry('info', 'User logged in');
 *
 * @example
 * // With error
 * try {
 *   // Some operation that might throw
 * } catch (error) {
 *   const entry = createLogEntry('error', 'Failed to process request', error);
 * }
 */
// Create a log entry object
export function createLogEntry(
  level: LogLevel,
  message: string,
  error?: ApiError
): LogEntry {
  // Implementation
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    error: error && {
      ...error,
      // Limit stack trace depth for better readability
      stack: error.stack?.split("\n").slice(0, 5).join("\n"),
    },
  };
}