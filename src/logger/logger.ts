import { LogLevel, LoggerConfig, LogEntry, ApiError } from "./types";
import { LogFormatter, createFormatter } from "./formatters";
import { safeAppendToLog, ensureLogDirectory, rotateLogFile } from "./writers";
import { extractRequestData } from "./extractors";
import { NextRequest } from "next/server";
import { DEFAULT_CONFIG } from "./constants";

/**
 * Main Logger class that provides a unified interface for all logging operations
 */
export class Logger {
  private config: Required<LoggerConfig>;
  private formatter: LogFormatter;
  
  /**
   * Creates a new Logger instance with optional custom configuration
   */
  constructor(config?: LoggerConfig) {
    // Merge provided config with defaults
    this.config = {
      logDir: config?.logDir || DEFAULT_CONFIG.LOG_DIR,
      maxLogSize: config?.maxLogSize || DEFAULT_CONFIG.MAX_LOG_SIZE,
      rotationInterval: config?.rotationInterval || DEFAULT_CONFIG.ROTATION_CHECK_INTERVAL,
      format: config?.format || 'json',
      formatOptions: config?.formatOptions || { maxStackDepth: 5 },
      consoleOutput: config?.consoleOutput || false,
      minLevel: config?.minLevel || LogLevel.INFO
    };
    
    // Initialize the formatter
    this.formatter = createFormatter(
      this.config.format, 
      this.config.formatOptions
    );
    
    // Ensure log directory exists when logger is created
    ensureLogDirectory(this.config.logDir).catch(err => {
      console.error("Failed to create log directory:", err);
    });
  }
  
  /**
   * Set a new formatter type with options
   */
  setFormat(format: 'json' | 'text' | 'csv', options?: any): void {
    this.config.format = format;
    this.config.formatOptions = options || this.config.formatOptions;
    this.formatter = createFormatter(format, options);
  }
  
  /**
   * Set a custom formatter implementation
   */
  setCustomFormatter(formatter: LogFormatter): void {
    this.formatter = formatter;
  }
  
  /**
   * Log an error message
   */
  async error(message: string, error: Error): Promise<void> {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.createLogEntry(
        LogLevel.ERROR, 
        message, 
        {
          path: "unknown",
          method: "unknown",
          statusCode: 500,
          errorName: error.name,
          errorMessage: error.message,
          stack: error.stack
        }
      );
      
      await this.writeLog(entry);
    }
  }
  
  /**
   * Log an API error with request context
   */
  async apiError(
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
    if (this.shouldLog(LogLevel.ERROR)) {
      // Extract request data if request object is provided
      let requestData: any = {};
      
      if (context.request) {
        const extractedData = extractRequestData(context.request);
        requestData = {
          query: extractedData.query,
          headers: extractedData.headers
        };
        
        // Use extracted path and method if not explicitly provided
        if (!context.path) context.path = extractedData.path;
        if (!context.method) context.method = extractedData.method;
      }
      
      // Add params and body if provided
      if (context.params) requestData.params = context.params;
      if (context.requestBody) requestData.body = context.requestBody;
      
      const entry = this.createLogEntry(LogLevel.ERROR, message, {
        path: context.path || "unknown",
        method: context.method || "unknown",
        statusCode: context.statusCode,
        errorName: error.name,
        errorMessage: error.message,
        stack: error.stack,
        requestData: Object.keys(requestData).length > 0 ? requestData : undefined
      });
      
      await this.writeLog(entry);
    }
  }
  
  /**
   * Log an informational message
   */
  async info(message: string): Promise<void> {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.createLogEntry(LogLevel.INFO, message);
      await this.writeLog(entry);
    }
  }
  
  /**
   * Log a warning message
   */
  async warn(message: string, details?: Record<string, unknown>): Promise<void> {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry = this.createLogEntry(LogLevel.WARN, message);
      await this.writeLog(entry);
    }
  }
  
  /**
   * Log a debug message (only if debug level is enabled)
   */
  async debug(message: string, data?: any): Promise<void> {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.createLogEntry(LogLevel.DEBUG, message);
      await this.writeLog(entry);
    }
  }
  
  /**
   * Create a standardized log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    error?: ApiError
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      error
    };
  }
  
  /**
   * Write a log entry to the configured destinations
   */
  private async writeLog(entry: LogEntry): Promise<void> {
    const formattedData = this.formatter.format(entry);
    
    // Write to file
    const logFilePath = `${this.config.logDir}/${this.getLogFileName(entry.level)}`;
    
    try {
      await safeAppendToLog(formattedData, logFilePath);
      
      // Also log to console if enabled
      if (this.config.consoleOutput) {
        this.logToConsole(entry);
      }
    } catch (error) {
      // If logging fails, at least try to log to console
      console.error("Failed to write log:", error);
    }
  }
  
  /**
   * Output a log entry to the console with appropriate formatting
   */
  private logToConsole(entry: LogEntry): void {
    const { level, message } = entry;
    
    // Use different console methods based on log level
    switch (level) {
      case LogLevel.ERROR:
        console.error(`[${level}] ${message}`, entry.error || '');
        break;
      case LogLevel.WARN:
        console.warn(`[${level}] ${message}`);
        break;
      case LogLevel.DEBUG:
        console.debug(`[${level}] ${message}`);
        break;
      case LogLevel.INFO:
      default:
        console.info(`[${level}] ${message}`);
        break;
    }
  }
  
  /**
   * Get the appropriate log file name based on log level
   */
  private getLogFileName(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR:
        return "errors.log";
      case LogLevel.WARN:
        return "warnings.log";
      case LogLevel.DEBUG:
        return "debug.log";
      case LogLevel.INFO:
      default:
        return "app.log";
    }
  }
  
  /**
   * Check if a log level should be recorded based on minimum level setting
   */
  private shouldLog(level: LogLevel): boolean {
    const levelOrder = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 1,
      [LogLevel.WARN]: 2,
      [LogLevel.ERROR]: 3
    };
    
    return levelOrder[level] >= levelOrder[this.config.minLevel];
  }
}
