// Type definitions and interfacexs

/**
 * Enum representing the log levels
 */
export enum LogLevel {
  ERROR = "ERROR",
  INFO = "INFO",
  WARN = "WARN",
  DEBUG = "DEBUG",
}

/**
 * Interface representing an API error structure of next.js App Router.
 */

export interface ApiError {
  // Your existing ApiError interface
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
  }
}

/**
  * Interface representing a log entry.
  */

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  error?: ApiError;
  // Other properties
}

/**
  * Configuration options for the logger.
  */

export interface LoggerConfig {
  /**
  * Directory where log files will be stored
  */
  logDir?: string;

  /**
  * Maximum size of log files rotation (in bytes)
  */
  maxLogSize?: number;
  /**
  * Interval to check for log rotation (in milliseconds)
  */
  rotationInterval?: number;
  /**
  * Default format for log entries ('json','text',or 'csv')
  */
  format?: 'json' | 'text' | 'csv';

  /**
   * Options specific to the selected formatter
  */
  formatOptions?:{
    /**
     * Whether to pretty-print JSON (for 'json' format)
    */
    pretty?:boolean;

  /**
   * Maximum stack trace depth to include in logs
   */
    maxStackDepth?:number;

/**
     * Any other format-specific options
     */
    [key: string]: any;

  };

 /**
   * Whether to also log to console
   */
  consoleOutput?: boolean;
  
  /**
   * Minimum log level to write (excludes levels below this)
   */
  minLevel?: LogLevel;
}

/**
 * Output destination options for logs
 */
export enum LogDestination {
  FILE = "file",
  CONSOLE = "console",
  REMOTE = "remote"
}
