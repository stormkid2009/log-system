# Modular Logger System - Detailed Explanation

## Architecture Overview

The modular logger system is built on a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC API LAYER                         │
│                     (index.ts)                              │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                       │
│                     (logger.ts)                             │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                   UTILITY LAYER                             │
│     log-entry.ts  │  request-utils.ts  │  file-manager.ts   │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                FOUNDATION LAYER                              │
│            types.ts    │    config.ts                       │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. **Foundation Layer**

#### `types.ts` - Type System
```typescript
enum LogLevel {
  ERROR = "ERROR",
  INFO = "INFO", 
  WARN = "WARN",
  DEBUG = "DEBUG"
}
```
- **Purpose**: Defines the contract for all logging operations
- **Key Types**:
  - `LogLevel`: Enum for log severity levels
  - `ApiError`: Structured error information for API failures
  - `LogEntry`: Final log entry format stored in files
- **Design Pattern**: **Type-First Design** - all other modules depend on these types

#### `config.ts` - Configuration Management
```typescript
export const DEFAULT_CONFIG = {
  LOG_DIR: path.resolve("logs"),
  LOG_FILE_PATH: path.join(path.resolve("logs"), "api-errors.log"),
  MAX_LOG_SIZE: Number(process.env.MAX_LOG_SIZE) || 10 * 1024 * 1024,
  ROTATION_CHECK_INTERVAL: 1000 * 60 * 5
};
```
- **Purpose**: Centralized configuration with environment variable support
- **Features**:
  - Environment variable integration (`process.env.MAX_LOG_SIZE`)
  - Sensible defaults (10MB max file size, 5-minute rotation checks)
  - Path resolution for cross-platform compatibility
- **Design Pattern**: **Configuration Object Pattern**

### 2. **Utility Layer**

#### `file-manager.ts` - File System Operations
This is the **most critical component** handling all file I/O operations:

```typescript
// Module-level state management
let lastRotationCheck = Date.now();
let writeQueue: Promise<void> = Promise.resolve();
```

**Key Features**:

1. **Write Queue Management**
   ```typescript
   writeQueue = writeQueue.then(async () => {
     // Sequential file operations
   });
   ```
   - **Problem Solved**: Prevents race conditions when multiple log operations happen simultaneously
   - **Mechanism**: Uses promise chaining to ensure sequential writes
   - **State Persistence**: Module-level variables maintain state across function calls

2. **Automatic Log Rotation**
   ```typescript
   if (Date.now() - lastRotationCheck > ROTATION_CHECK_INTERVAL) {
     await rotateLogFile(logFilePath);
     lastRotationCheck = Date.now();
   }
   ```
   - **Trigger**: Time-based checks (every 5 minutes) + size-based rotation
   - **Naming Convention**: `api-errors-2025-07-04T10-30-00-000Z.log`
   - **Safety**: Never loses log data during rotation

3. **Directory Management**
   ```typescript
   await fs.mkdir(logDir, { recursive: true });
   ```
   - **Auto-creation**: Creates nested directories if they don't exist
   - **Error Handling**: Graceful degradation - logs to console if directory creation fails

#### `request-utils.ts` - Request Data Extraction
```typescript
export function extractRequestData(request: NextRequest | Request) {
  // Extract URL, method, headers, query parameters
}
```
- **Purpose**: Safely extracts debugging information from HTTP requests
- **Privacy Features**:
  - **Allowlist approach**: Only captures specific headers (content-type, user-agent, etc.)
  - **No sensitive data**: Avoids authorization headers, cookies, etc.
- **Error Handling**: Returns safe defaults if extraction fails
- **Next.js Integration**: Works with both `NextRequest` and standard `Request` objects

#### `log-entry.ts` - Log Entry Creation
```typescript
export function createLogEntry(level: LogLevel, message: string, error?: ApiError): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    error: error && {
      ...error,
      stack: error.stack?.split("\n").slice(0, 5).join("\n"), // Stack trace limiting
    },
  };
}
```
- **Purpose**: Creates standardized log entries with consistent formatting
- **Features**:
  - **ISO timestamp**: Consistent, sortable timestamps
  - **Stack trace limiting**: Prevents extremely long stack traces (max 5 lines)
  - **Optional error data**: Handles both simple messages and complex error objects

### 3. **Business Logic Layer**

#### `logger.ts` - Main Logging Functions
This orchestrates all the utility components:

```typescript
export async function logApiError(message: string, error: Error, context: {...}) {
  // 1. Extract request data
  let requestData: any = {};
  if (context.request) {
    const extractedData = extractRequestData(context.request);
    // Build request context
  }
  
  // 2. Create structured log entry
  const logEntry = createLogEntry(LogLevel.ERROR, message, {
    path: context.path || "unknown",
    method: context.method || "unknown",
    statusCode: context.statusCode,
    errorName: error.name,
    errorMessage: error.message,
    stack: error.stack,
    requestData: Object.keys(requestData).length > 0 ? requestData : undefined,
  });

  // 3. Write to file
  await safeAppendToLog(JSON.stringify(logEntry));
}
```

**Flow Diagram**:
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Extract        │    │  Create Log     │    │  Write to       │
│  Request Data   │───▶│  Entry          │───▶│  File           │
│  (if available) │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 4. **Public API Layer**

#### `index.ts` - Clean Public Interface
```typescript
// Main logging functions
export { logApiError, logError, logInfo, logWarn } from "./logger";

// Advanced utilities for power users
export { createLogEntry } from "./log-entry";
export { extractRequestData } from "./request-utils";
export { safeAppendToLog, ensureLogDirectory, rotateLogFile } from "./file-manager";
```

## Data Flow Example

Let's trace through a complete logging operation:

### Scenario: API Error in Next.js Route Handler

```typescript
// app/api/users/route.ts
import { logApiError } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Some API logic that fails
    throw new Error("Database connection failed");
  } catch (error) {
    await logApiError(
      "Failed to fetch users",
      error as Error,
      {
        request,
        statusCode: 500,
        params: { userId: "123" }
      }
    );
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### Step-by-Step Flow:

1. **`logApiError()` called** (logger.ts)
   - Receives: message, error object, context with request

2. **Request data extraction** (request-utils.ts)
   ```typescript
   extractRequestData(request) → {
     path: "/api/users",
     method: "GET",
     headers: { "content-type": "application/json", ... },
     query: { limit: "10" }
   }
   ```

3. **Log entry creation** (log-entry.ts)
   ```typescript
   createLogEntry(LogLevel.ERROR, "Failed to fetch users", {
     path: "/api/users",
     method: "GET",
     statusCode: 500,
     errorName: "Error",
     errorMessage: "Database connection failed",
     stack: "Error: Database connection failed\n    at GET (/app/api/users/route.ts:5:11)\n...",
     requestData: { headers: {...}, query: {...}, params: {...} }
   })
   ```

4. **File writing** (file-manager.ts)
   ```typescript
   // Check if rotation needed
   if (Date.now() - lastRotationCheck > 5 minutes) {
     await rotateLogFile(); // Rotate if file > 10MB
   }
   
   // Add to write queue
   writeQueue = writeQueue.then(async () => {
     await ensureLogDirectory();
     await fs.appendFile(logFilePath, JSON.stringify(logEntry) + "\n");
   });
   ```

5. **Final log file entry**:
   ```json
   {
     "timestamp": "2025-07-04T10:30:00.000Z",
     "level": "ERROR",
     "message": "Failed to fetch users",
     "error": {
       "path": "/api/users",
       "method": "GET",
       "statusCode": 500,
       "errorName": "Error",
       "errorMessage": "Database connection failed",
       "stack": "Error: Database connection failed\n    at GET (/app/api/users/route.ts:5:11)\n...",
       "requestData": {
         "headers": { "content-type": "application/json" },
         "query": { "limit": "10" },
         "params": { "userId": "123" }
       }
     }
   }
   ```

## Key Design Patterns

### 1. **Single Responsibility Principle**
Each module has one clear purpose:
- `types.ts`: Type definitions only
- `config.ts`: Configuration only
- `file-manager.ts`: File operations only
- etc.

### 2. **Dependency Inversion**
- High-level modules (logger.ts) depend on abstractions (types.ts)
- Low-level modules (file-manager.ts) implement the abstractions
- Easy to mock for testing

### 3. **Promise Queue Pattern**
```typescript
writeQueue = writeQueue.then(async () => {
  // Sequential operations
});
```
- Ensures file writes never overlap
- Prevents corruption from concurrent access
- Maintains order of log entries

### 4. **Graceful Degradation**
```typescript
try {
  await fs.appendFile(logFilePath, data);
} catch (error) {
  console.error("Failed to write to log file:", error);
  // Application continues running
}
```
- Logging failures don't crash the application
- Fallback to console logging
- Production-ready error handling

## Benefits of This Architecture

1. **Testability**: Each function can be unit tested in isolation
2. **Maintainability**: Changes to one component don't affect others
3. **Reusability**: Utility functions can be used independently
4. **Scalability**: Easy to add new log formats or storage backends
5. **Type Safety**: Strong typing prevents runtime errors
6. **Performance**: Efficient file operations with rotation and queuing
7. **Debugging**: Clear separation makes troubleshooting easier

## Usage Patterns

### Basic Usage (Same as Original)
```typescript
import { logApiError, logError, logInfo, logWarn } from './logger';

// API error logging
await logApiError("Payment failed", error, { request, statusCode: 400 });

// General error logging
await logError("Service unavailable", error);

// Info logging
await logInfo("User logged in successfully");
```

### Advanced Usage (New Capabilities)
```typescript
import { extractRequestData, createLogEntry, safeAppendToLog } from './logger';

// Custom log processing
const requestData = extractRequestData(request);
const customEntry = createLogEntry(LogLevel.DEBUG, "Custom debug info", {
  path: requestData.path,
  method: requestData.method,
  statusCode: 200,
  errorName: "Debug",
  errorMessage: "Performance metrics",
  requestData: { timing: "150ms" }
});

await safeAppendToLog(JSON.stringify(customEntry));
```

This modular architecture provides all the robustness of the original monolithic logger while adding flexibility, maintainability, and extensibility for future requirements.