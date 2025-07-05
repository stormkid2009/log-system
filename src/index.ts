// index.ts - Main export file
export { LogLevel } from "./types";
export type { ApiError, LogEntry } from "./types";
export { logApiError, logError, logInfo, logWarn } from "./logger";
export { setlastRotationCheck } from "./file-manager";
export { DEFAULT_CONFIG } from "./config";

// Re-export utility functions for advanced usage
export { createLogEntry } from "./log-entry";
export { extractRequestData } from "./request-utils";
export {
  safeAppendToLog,
  ensureLogDirectory,
  rotateLogFile,
} from "./file-manager";
