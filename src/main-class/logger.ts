import fs from "fs";
import path from "path";

/**
 * Log levels supported by the Logger.
 */
export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

/**
 * Logger class for writing log messages to a file and the console.
 *
 * - Supports INFO, WARN, and ERROR levels.
 * - Ensures the log directory exists before writing.
 * - Appends log entries to the specified log file.
 */
export class Logger {
  private logFile: string;

  /**
   * Create a new Logger instance.
   * @param logFilePath - Absolute or relative path to the log file. Defaults to '../logs/app.log' relative to this file.
   */
  constructor(logFilePath: string = path.join(__dirname, "../logs/app.log")) {
    this.logFile = logFilePath;
    // Ensure log directory exists
    fs.mkdirSync(path.dirname(this.logFile), { recursive: true });
  }

  /**
   * Write a log entry with the specified level and message.
   * @param level - The log level (INFO, WARN, ERROR).
   * @param message - The message to log.
   */
  log(level: LogLevel, message: string) {
    const logEntry = `[${new Date().toISOString()}] [${level}] ${message}\n`;
    fs.appendFileSync(this.logFile, logEntry);
    console.log(logEntry.trim());
  }

  /**
   * Write an INFO level log entry.
   * @param message - The message to log.
   */
  info(message: string) {
    this.log(LogLevel.INFO, message);
  }

  /**
   * Write a WARN level log entry.
   * @param message - The message to log.
   */
  warn(message: string) {
    this.log(LogLevel.WARN, message);
  }

  /**
   * Write an ERROR level log entry.
   * @param message - The message to log.
   */
  error(message: string) {
    this.log(LogLevel.ERROR, message);
  }
}

// Example usage
const logger = new Logger();
logger.info("Logging system initialized.");
