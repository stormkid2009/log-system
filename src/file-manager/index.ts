/**
 * File Manager Module
 *
 * Provides file system operations for log management, including:
 * - Safe, sequential log writing
 * - Log file rotation
 * - Directory management
 *
 * This module ensures thread-safe file operations and automatic log rotation
 * to prevent log files from growing too large.
 *
 * @module file-manager
 */

import fs from "fs/promises";
import path from "path";
import { DEFAULT_CONFIG } from "../config";

/**
 * Promise queue to ensure sequential file writes
 * @private
 */
let writeQueue: Promise<void> = Promise.resolve();

/**
 * Timestamp of the last log rotation check
 * @private
 */
let lastRotationCheck = Date.now();

/**
 * Sets the last rotation check timestamp.
 * Primarily used for testing purposes.
 *
 * @param {number} value - Timestamp to set
 * @example
 * // In test setup
 * setlastRotationCheck(0); // Force rotation check on next write
 */
export function setlastRotationCheck(value: number) {
  lastRotationCheck = value;
}

/**
 * Ensures that the log directory exists.
 * If the directory does not exist, it is created recursively.
 *
 * @async
 * @param {string} [logDir=DEFAULT_CONFIG.LOG_DIR] - The directory path where logs will be stored
 * @throws {Error} If directory creation fails
 * @example
 * await ensureLogDirectory('/var/log/myapp');
 */
export async function ensureLogDirectory(logDir = DEFAULT_CONFIG.LOG_DIR) {
  try {
    await fs.mkdir(logDir, { recursive: true });
  } catch (error) {
    console.error("Failed to create logs directory:", error);
    throw error;
  }
}

/**
 * Rotates the log file if it exceeds the maximum allowed size.
 * The current log file is renamed with a timestamp appended to its filename.
 *
 * @async
 * @param {string} [logFilePath=DEFAULT_CONFIG.LOG_FILE_PATH] - Path to the log file
 * @param {number} [maxSize=DEFAULT_CONFIG.MAX_LOG_SIZE] - Maximum size in bytes before rotation
 * @returns {Promise<void>}
 * @example
 * await rotateLogFile('/var/log/myapp/error.log', 10 * 1024 * 1024); // 10MB
 */
export async function rotateLogFile(
  logFilePath = DEFAULT_CONFIG.LOG_FILE_PATH,
  maxSize = DEFAULT_CONFIG.MAX_LOG_SIZE
) {
  const now = new Date();
  try {
    const stats = await fs.stat(logFilePath).catch(() => null);

    if (stats && stats.size >= maxSize) {
      const dir = path.dirname(logFilePath);
      const ext = path.extname(logFilePath);
      const base = path.basename(logFilePath, ext);
      const timestamp = now.toISOString().replace(/[:.]/g, "-");
      const newPath = path.join(dir, `${base}-${timestamp}${ext}`);

      await fs.rename(logFilePath, newPath);
    }
  } catch (error) {
    console.error("Failed to create logs directory:", error);
  }
}

/**
 * Safely appends data to the log file with queue management.
 * Ensures the log directory exists, checks for rotation, and maintains write order.
 *
 * @async
 * @param {string} data - The formatted log data to append
 * @param {string} [logFilePath=DEFAULT_CONFIG.LOG_FILE_PATH] - Path to the log file
 * @param {number} [maxSize=DEFAULT_CONFIG.MAX_LOG_SIZE] - Maximum size in bytes before rotation
 * @returns {Promise<void>} Resolves when the write operation completes
 * @example
 * await safeAppendToLog('2023-01-01T00:00:00.000Z [INFO] Application started');
 */
export async function safeAppendToLog(
  data: string,
  logFilePath = DEFAULT_CONFIG.LOG_FILE_PATH,
  maxSize = DEFAULT_CONFIG.MAX_LOG_SIZE
): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    try {
      const logDir = path.dirname(logFilePath);
      await ensureLogDirectory(logDir);

      // Always check file size before every write
      await rotateLogFile(logFilePath, maxSize);

      await fs.appendFile(logFilePath, data + "\n", "utf8");

      // Check again after writing in case the file now exceeds the limit
      await rotateLogFile(logFilePath, maxSize);
    } catch (error) {
      console.error("Failed to write to log file:", error);
    }
  });

  return writeQueue;
}

// Export internal state for testing
export { lastRotationCheck, writeQueue };
