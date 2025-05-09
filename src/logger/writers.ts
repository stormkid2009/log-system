import fs from "fs/promises";
import path from "path";
import { DEFAULT_CONFIG } from "./constants";

// Track the write queue for sequential file writes
let writeQueue: Promise<void> = Promise.resolve();
let lastRotationCheck = Date.now();

/**
 * Ensures that the log directory exists.
 * If the directory does not exist, it is created recursively.
 * 
 * @param logDir - The directory path where logs will be stored
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
 * @param logFilePath - The path to the log file to check
 * @param maxSize - Maximum size in bytes before rotation occurs
 */
export async function rotateLogFile(
  logFilePath = DEFAULT_CONFIG.LOG_FILE_PATH, 
  maxSize = DEFAULT_CONFIG.MAX_LOG_SIZE
) {
  const now = new Date();
  try {
    // Check if the log file exists and get its stats
    const stats = await fs.stat(logFilePath).catch(() => null);

    if (stats && stats.size >= maxSize) {
      // Create a timestamped backup filename
      const dir = path.dirname(logFilePath);
      const ext = path.extname(logFilePath);
      const base = path.basename(logFilePath, ext);
      const timestamp = now.toISOString().replace(/[:.]/g, "-");
      const newPath = path.join(dir, `${base}-${timestamp}${ext}`);
      
      // Rename the current log file to the backup name
      await fs.rename(logFilePath, newPath);
    }
  } catch (error) {
    console.error("Log rotation failed:", error);
    throw error;
  }
}

/**
 * Safely appends the provided log data to the log file.
 * Ensures the log directory exists, checks for file rotation, and writes sequentially using a write queue.
 *
 * @param data - The formatted log data to append
 * @param logFilePath - The path to the log file
 * @returns A promise that resolves when the write operation is completed
 */
export async function safeAppendToLog(
  data: string, 
  logFilePath = DEFAULT_CONFIG.LOG_FILE_PATH
): Promise<void> {
  // Use a promise queue to ensure sequential writes
  writeQueue = writeQueue.then(async () => {
    try {
      // Get the directory from the log file path
      const logDir = path.dirname(logFilePath);
      
      // Ensure the log directory exists
      await ensureLogDirectory(logDir);

      // Check log rotation interval
      if (Date.now() - lastRotationCheck > DEFAULT_CONFIG.ROTATION_CHECK_INTERVAL) {
        await rotateLogFile(logFilePath);
        lastRotationCheck = Date.now();
      }

      // Append the data to the log file
      await fs.appendFile(logFilePath, data + "\n", "utf8");
    } catch (error) {
      console.error("Failed to write to log file:", error);
      throw error;
    }
  });

  return writeQueue;
}
