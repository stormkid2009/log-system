import fs from "fs";
import path from "path";

export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export class Logger {
  private logFile: string;

  constructor(logFilePath: string = path.join(__dirname, "../logs/app.log")) {
    this.logFile = logFilePath;
    // Ensure log directory exists
    fs.mkdirSync(path.dirname(this.logFile), { recursive: true });
  }

  log(level: LogLevel, message: string) {
    const logEntry = `[${new Date().toISOString()}] [${level}] ${message}\n`;
    fs.appendFileSync(this.logFile, logEntry);
    console.log(logEntry.trim());
  }

  info(message: string) {
    this.log(LogLevel.INFO, message);
  }

  warn(message: string) {
    this.log(LogLevel.WARN, message);
  }

  error(message: string) {
    this.log(LogLevel.ERROR, message);
  }
}

// Example usage
const logger = new Logger();
logger.info("Logging system initialized.");
