// Export types
export * from "@/types/types";

// Export core functionality
export * from "@/formatters";
export * from "@/writers/writers";
export * from "@/extractors";

// Export the Logger class
export { Logger } from "./logger";

// Create a default logger instance for easy use
import { Logger } from "./logger";
const defaultLogger = new Logger();

// Export individual logging functions that use the default logger
export const logError = defaultLogger.error.bind(defaultLogger);
export const logApiError = defaultLogger.apiError.bind(defaultLogger);
export const logInfo = defaultLogger.info.bind(defaultLogger);
export const logWarn = defaultLogger.warn.bind(defaultLogger);
export const logDebug = defaultLogger.debug.bind(defaultLogger);

// Configure the default logger (convenience function)
export function configureLogger(config: Parameters<typeof Logger>[0]) {
  return new Logger(config);
}
