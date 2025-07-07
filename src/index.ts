/**
 * @module log-system
 * @description
 * Main entry point for the log system module.
 *
 * This module provides a comprehensive logging solution with the following features:
 * - Multiple log levels (INFO, WARN, ERROR, etc.)
 * - API error logging with context
 * - Log file rotation and management
 * - Request data extraction utilities
 * - Configurable logging behavior
 *
 * @example
 * ```typescript
 * import { logInfo, logError, LogLevel } from 'log-system';
 *
 * // Basic logging
 * logInfo('Application started');
 *
 * try {
 *   // Your code here
 * } catch (error) {
 *   logError('Operation failed', error);
 * }
 * ```
 */

// Core types and enums
export { LogLevel } from "./types";

export type { ApiError, LogEntry } from "./types";

// Core logging functions
export { logApiError, logError, logInfo, logWarn } from "./logger";

// File management utilities
export { setlastRotationCheck } from "./file-manager";

export { DEFAULT_CONFIG } from "./config";

// Advanced usage utilities
export { createLogEntry } from "./log-entry";

export { extractRequestData } from "./request-utils";

/**
 * File management utilities for log rotation and maintenance
 */
export {
  safeAppendToLog,
  ensureLogDirectory,
  rotateLogFile,
} from "./file-manager";
