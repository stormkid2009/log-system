import path from "path";

/**
 * Default configuration values for the logger
 */
export const DEFAULT_CONFIG = {
  /**
   * Default directory for storing log files
   */
  LOG_DIR: path.resolve("logs"),
  
  /**
   * Default path for the main log file
   */
  LOG_FILE_PATH: path.join(path.resolve("logs"), "api-errors.log"),
  
  /**
   * Default maximum log file size before rotation (10MB)
   */
  MAX_LOG_SIZE: 10 * 1024 * 1024,
  
  /**
   * Default interval to check for log rotation (5 minutes)
   */
  ROTATION_CHECK_INTERVAL: 1000 * 60 * 5
};
