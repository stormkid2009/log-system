// Log formatting utilites

import { LogEntry, LogLevel, ApiError } from './types';

/**
 * Interface for log formatters
 */
export interface LogFormatter {
  format(entry: LogEntry): string;
}

/**
 * Default JSON formatter that converts log entries to JSON strings
 */
export class JsonFormatter implements LogFormatter {
  /**
   * Options for JSON formatting
   */
  constructor(private options: {
    /**
     * Whether to pretty-print the JSON with indentation
     */
    pretty?: boolean;
    /**
     * Maximum depth for error stack traces
     */
    maxStackDepth?: number;
  } = {}) {}

  /**
   * Format a log entry as JSON
   */
  format(entry: LogEntry): string {
    // Clone the entry to avoid modifying the original
    const formattedEntry = { ...entry };
    
    // Process the error field if it exists
    if (formattedEntry.error) {
      formattedEntry.error = this.formatError(formattedEntry.error);
    }
    
    // Convert to JSON string with optional pretty printing
    return this.options.pretty 
      ? JSON.stringify(formattedEntry, null, 2)
      : JSON.stringify(formattedEntry);
  }
  
  /**
   * Format error details, including truncating stack traces
   */
  private formatError(error: ApiError): ApiError {
    const formattedError = { ...error };
    
    // Truncate stack trace if needed
    if (formattedError.stack && this.options.maxStackDepth) {
      formattedError.stack = formattedError.stack
        .split('\n')
        .slice(0, this.options.maxStackDepth)
        .join('\n');
    }
    
    return formattedError;
  }
}

/**
 * Simple text formatter that outputs log entries in human-readable text format
 */
export class TextFormatter implements LogFormatter {
  /**
   * Format a log entry as plain text
   */
  format(entry: LogEntry): string {
    // Base log line with timestamp, level, and message
    let output = `[${entry.timestamp}] ${entry.level}: ${entry.message}`;
    
    // Add error details if present
    if (entry.error) {
      output += `\nError: ${entry.error.errorName} - ${entry.error.errorMessage}`;
      
      // Add request details if available
      if (entry.error.path) {
        output += `\nPath: ${entry.error.method} ${entry.error.path}`;
        output += `\nStatus: ${entry.error.statusCode}`;
      }
      
      // Add stack trace if available
      if (entry.error.stack) {
        output += `\nStack: ${entry.error.stack}`;
      }
      
      // Add request data if available
      if (entry.error.requestData) {
        const { query, params, headers, body } = entry.error.requestData;
        
        if (query && Object.keys(query).length > 0) {
          output += `\nQuery: ${JSON.stringify(query)}`;
        }
        
        if (params && Object.keys(params).length > 0) {
          output += `\nParams: ${JSON.stringify(params)}`;
        }
        
        if (headers && Object.keys(headers).length > 0) {
          output += `\nHeaders: ${JSON.stringify(headers)}`;
        }
        
        if (body) {
          output += `\nBody: ${JSON.stringify(body)}`;
        }
      }
    }
    
    return output;
  }
}

/**
 * CSV formatter that outputs log entries in CSV format
 * Useful for importing logs into spreadsheets or data analysis tools
 */
export class CsvFormatter implements LogFormatter {
  /**
   * Column headers for the CSV format
   */
  private headers = ['timestamp', 'level', 'message', 'errorName', 'errorMessage', 'path', 'method', 'statusCode'];
  
  /**
   * Whether headers have been written yet
   */
  private headersWritten = false;
  
  /**
   * Format a log entry as a CSV row
   */
  format(entry: LogEntry): string {
    // Create a row object with all potential columns
    const row: Record<string, string> = {
      timestamp: entry.timestamp,
      level: entry.level,
      message: this.escapeCsvField(entry.message),
      errorName: '',
      errorMessage: '',
      path: '',
      method: '',
      statusCode: ''
    };
    
    // Add error details if present
    if (entry.error) {
      row.errorName = this.escapeCsvField(entry.error.errorName);
      row.errorMessage = this.escapeCsvField(entry.error.errorMessage);
      row.path = this.escapeCsvField(entry.error.path);
      row.method = entry.error.method;
      row.statusCode = entry.error.statusCode.toString();
    }
    
    // If headers haven't been written yet, include them
    if (!this.headersWritten) {
      this.headersWritten = true;
      return this.headers.join(',') + '\n' + this.headers.map(h => row[h]).join(',');
    }
    
    // Otherwise just return the data row
    return this.headers.map(h => row[h]).join(',');
  }
  
  /**
   * Escape special characters in CSV fields
   */
  private escapeCsvField(value: string): string {
    if (!value) return '';
    
    // If the field contains quotes, commas, or newlines, enclose in quotes and escape internal quotes
    if (/[",\n\r]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    
    return value;
  }
  
  /**
   * Reset the headers written flag
   * Call this when starting a new CSV file
   */
  resetHeaders(): void {
    this.headersWritten = false;
  }
}

/**
 * Factory function to create a formatter by name
 */
export function createFormatter(
  type: 'json' | 'text' | 'csv' = 'json', 
  options: any = {}
): LogFormatter {
  switch (type) {
    case 'text':
      return new TextFormatter();
    case 'csv':
      return new CsvFormatter();
    case 'json':
    default:
      return new JsonFormatter(options);
  }
}
