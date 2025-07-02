# Log System - Project Structure

## 📁 Directory Tree
```
log-system/
├── 📁 config/                    # Configuration files (empty)
├── 📁 dist/                      # Compiled JavaScript output
│   ├── index.js
│   └── 📁 logger/
│       ├── constants.js
│       ├── core.js
│       ├── examples.js
│       ├── extractors.js
│       ├── formatters.js
│       ├── index.js
│       ├── logger.js
│       ├── 📁 loggers/
│       │   ├── api.js
│       │   ├── error.js
│       │   ├── info.js
│       │   └── warn.js
│       ├── types.js
│       └── writers.js
├── 📁 src/                       # TypeScript source code
│   ├── index.ts                  # Main entry point
│   └── 📁 logger/                # Core logging system
│       ├── constants.ts          # Configuration constants
│       ├── core.ts               # Core logging functions
│       ├── examples.ts           # Usage examples
│       ├── extractors.ts         # Request data extraction
│       ├── formatters.ts         # Log formatters (JSON/Text/CSV)
│       ├── index.ts              # Logger module exports
│       ├── 📁 loggers/           # Specialized loggers
│       │   ├── api.ts            # API-specific logging
│       │   ├── error.ts          # Error logging
│       │   ├── info.ts           # Info logging
│       │   └── warn.ts           # Warning logging
│       ├── logger.ts             # Main Logger class
│       ├── types.ts              # TypeScript type definitions
│       └── writers.ts            # File writing operations
├── 📁 test/                      # Test files (empty)
├── 📁 types/                     # Additional type definitions (empty)
├── .gitignore                    # Git ignore rules
├── package.json                  # NPM package configuration
├── package-lock.json             # NPM lock file
├── PROGRESS_SCHEDULE.md          # Development schedule
└── tsconfig.json                 # TypeScript configuration
```

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           LOG SYSTEM ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────────────┘

                          📱 CLIENT APPLICATIONS
                                    │
                                    ▼
    ┌───────────────────────────────────────────────────────────────────┐
    │                        PUBLIC API (index.ts)                      │
    │   • logError()  • logApiError()  • logInfo()  • logWarn()        │
    │   • configureLogger()  • Logger class                            │
    └───────────────────────────┬───────────────────────────────────────┘
                                │
                                ▼
    ┌───────────────────────────────────────────────────────────────────┐
    │                     MAIN LOGGER CLASS                             │
    │                        (logger.ts)                               │
    │   • Configuration Management                                      │
    │   • Log Level Filtering                                          │
    │   • Format Selection                                             │
    │   • Output Routing                                               │
    └─────────────┬─────────────┬─────────────┬───────────────┬─────────┘
                  │             │             │               │
                  ▼             ▼             ▼               ▼
    ┌─────────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │   FORMATTERS    │ │  EXTRACTORS │ │   WRITERS   │ │ SPECIALIZED │
    │ (formatters.ts) │ │(extractors.ts)│ │(writers.ts) │ │   LOGGERS   │
    │                 │ │             │ │             │ │ (loggers/)  │
    │ • JsonFormatter │ │ • Request   │ │ • File I/O  │ │ • api.ts    │
    │ • TextFormatter │ │   Data      │ │ • Rotation  │ │ • error.ts  │
    │ • CsvFormatter  │ │   Extraction│ │ • Queue     │ │ • info.ts   │
    │                 │ │ • Headers   │ │ • Safety    │ │ • warn.ts   │
    └─────────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
                  │             │             │
                  │             │             ▼
                  │             │    ┌─────────────────┐
                  │             │    │  FILE SYSTEM    │
                  │             │    │                 │
                  │             │    │ • app.log       │
                  │             │    │ • errors.log    │
                  │             │    │ • warnings.log  │
                  │             │    │ • debug.log     │
                  │             │    └─────────────────┘
                  │             │
                  ▼             ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                         OUTPUT LAYER                            │
    │   • Console Output  • File Output  • Remote Output (future)    │
    └─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Module Dependencies

```
┌─────────────────────────────────────────────────────────────────────┐
│                       DEPENDENCY GRAPH                              │
└─────────────────────────────────────────────────────────────────────┘

index.ts (Entry Point)
    └── logger/index.ts
            ├── types.ts (Type Definitions)
            ├── constants.ts (Configuration)
            ├── logger.ts (Main Class)
            │   ├── formatters.ts
            │   │   └── types.ts
            │   ├── writers.ts
            │   │   └── constants.ts
            │   ├── extractors.ts
            │   └── constants.ts
            ├── core.ts
            │   ├── types.ts
            │   └── writers.ts
            └── loggers/
                ├── api.ts
                ├── error.ts
                ├── info.ts
                └── warn.ts

External Dependencies:
    ├── next/server (NextRequest types)
    ├── fs/promises (File operations)
    ├── path (Path utilities)
    └── Node.js built-ins
```

---

## 📊 Component Breakdown

### Core Components (6 files)
| Component | Purpose | Status | Lines of Code |
|-----------|---------|--------|---------------|
| `logger.ts` | Main Logger class with all methods | ✅ Complete | ~252 |
| `types.ts` | TypeScript interfaces and enums | ✅ Complete | ~108 |
| `formatters.ts` | JSON/Text/CSV output formatting | ✅ Complete | ~208 |
| `writers.ts` | File I/O and rotation logic | ✅ Complete | ~94 |
| `extractors.ts` | Request data extraction | ✅ Complete | ~52 |
| `constants.ts` | Default configuration values | ✅ Complete | ~27 |

### Specialized Loggers (4 files)
| Component | Purpose | Status | Implementation |
|-----------|---------|--------|----------------|
| `api.ts` | API-specific logging | 🔄 Partial | Needs completion |
| `error.ts` | Error logging utilities | 🔄 Partial | Needs completion |
| `info.ts` | Info logging utilities | 🔄 Partial | Needs completion |
| `warn.ts` | Warning logging utilities | 🔄 Partial | Needs completion |

### Support Files (3 files)
| Component | Purpose | Status | Notes |
|-----------|---------|--------|-------|
| `index.ts` | Module exports and convenience functions | ✅ Complete | Has type errors |
| `core.ts` | Core utility functions | ⚠️ Has bugs | Type mismatch |
| `examples.ts` | Usage examples and demos | ⚠️ Has errors | Import issues |

---

## 🎯 Data Flow

```
[User Request] 
    ↓
[Logger Method Call (info/error/warn/debug)]
    ↓
[Log Level Check (shouldLog)]
    ↓
[Create Log Entry (createLogEntry)]
    ↓
[Request Data Extraction (if API error)]
    ↓
[Format Selection (JSON/Text/CSV)]
    ↓
[Write to Destinations]
    ├── File System (writers.ts)
    └── Console Output (if enabled)
```

---

## 🔧 Configuration Flow

```
[Default Config (constants.ts)]
    ↓
[User Config Override]
    ↓
[Logger Constructor]
    ↓
[Formatter Selection]
    ↓
[Runtime Configuration]
```

---

## 📝 Key Interfaces

### Main Types
- `LogLevel`: ERROR | INFO | WARN | DEBUG
- `LogEntry`: Complete log record structure
- `ApiError`: API-specific error information
- `LoggerConfig`: Configuration options
- `LogFormatter`: Formatter interface

### File Organization
- **Source**: `src/` - TypeScript source files
- **Output**: `dist/` - Compiled JavaScript
- **Config**: `config/` - Configuration files (empty)
- **Tests**: `test/` - Test files (empty)
- **Types**: `types/` - Additional type definitions (empty)

---

## 🚀 Build Process

```
TypeScript Source (src/)
    ↓ [tsc compilation]
JavaScript Output (dist/)
    ↓ [npm packaging]
Distributable Package
```

---

*Project contains 33 files across 10 directories*  
*Source: 13 TypeScript files, ~1000+ lines of code*  
*Status: Core features complete, needs build fixes and testing*
