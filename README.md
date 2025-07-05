# Log System

A robust TypeScript logging library for API errors and general logging.

## Installation
\`\`\`bash
npm install log-system
\`\`\`

## Usage
\`\`\`typescript
import { logApiError, logInfo, logWarn, logError } from 'log-system';

// Basic logging
await logInfo('Application started');
await logWarn('Warning message', { context: 'data' });
await logError('Error occurred', new Error('Something went wrong'));

// API error logging
await logApiError('API request failed', error, {
  request: req,
  statusCode: 500,
  params: { id: '123' }
});
\`\`\`
