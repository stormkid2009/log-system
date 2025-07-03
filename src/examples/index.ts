// Example 1: Basic usage with the default logger
import { logInfo, logError, logApiError } from '@/logger';

// Log an informational message
logInfo('Application started successfully');

try {
  // Some code that might throw an error
  throw new Error('Database connection failed');
} catch (error) {
  // Log a general error
  logError('Failed to connect to database', error);
}

// Example 2: Creating a custom logger instance
import { Logger, LogLevel } from '@/logger';

// Create a custom logger with specific configuration
const logger = new Logger({
  logDir: './custom-logs',
  format: 'text',
  consoleOutput: true,
  minLevel: LogLevel.DEBUG
});

// Use the custom logger
logger.info('Custom logger initialized');
logger.debug('Debug information about system state', { memory: process.memoryUsage() });

// Switch format on the fly
logger.setFormat('json', { pretty: true });
logger.warn('Switching to JSON format for more detailed logs');

// Example 3: API error logging in Next.js API route
// pages/api/users.js
import { Logger } from '@/logger';
import { NextRequest, NextResponse } from 'next/server';

// Create a logger specifically for API routes
const apiLogger = new Logger({
  format: 'json',
  formatOptions: { maxStackDepth: 10 },
  consoleOutput: process.env.NODE_ENV === 'development'
});

export async function GET(req: NextRequest) {
  try {
    // API logic here...
    const result = await fetchUsers();
    return NextResponse.json(result);
  } catch (error) {
    // Log the API error with request context
    await apiLogger.apiError('Error fetching users', error, {
      request: req,
      statusCode: 500
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// Example 4: Using formatters directly
import { createFormatter, LogFormatter } from '@/logger';

// Create a custom formatter
class ClickhouseFormatter implements LogFormatter {
  format(entry) {
    // Format logs specifically for Clickhouse database
    return JSON.stringify({
      _timestamp: entry.timestamp,
      _level: entry.level,
      _message: entry.message,
      _error: entry.error ? entry.error.errorMessage : null,
      _source: 'web-app'
    });
  }
}

// Use the custom formatter with a logger
const analyticsLogger = new Logger();
analyticsLogger.setCustomFormatter(new ClickhouseFormatter());
