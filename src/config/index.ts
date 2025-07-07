/**
 * Configuration module for the logging system.
 *
 * This module exports default configuration values used throughout the application
 * for logging purposes. It includes settings for log directories, file paths,
 * rotation policies, and other logging-related configurations.
 *
 * @module config
 */

import path from "path";

/**
 * Default configuration values for the logger.
 *
 * These settings control the behavior of the logging system, including
 * file locations, rotation policies, and performance settings.
 *
 * @type {Object}
 * @property {string} LOG_DIR - Default directory for storing log files.
 *                              Defaults to a 'logs' directory in the project root.
 * @property {string} LOG_FILE_PATH - Default path for the main log file.
 *                                   Defaults to 'logs/api-errors.log' in the project root.
 * @property {number} MAX_LOG_SIZE - Maximum log file size in bytes before rotation occurs.
 *                                   Defaults to 10MB (10 * 1024 * 1024 bytes).
 * @property {number} ROTATION_CHECK_INTERVAL - Interval in milliseconds to check for log rotation.
 *                                              Defaults to 5 minutes (300,000 ms).
 */
export const DEFAULT_CONFIG = {
  /**
   * Default directory for storing log files.
   * @default path.resolve("logs")
   */
  LOG_DIR: path.resolve("logs"),

  /**
   * Default path for the main log file.
   * @default path.join(path.resolve("logs"), "api-errors.log")
   */
  LOG_FILE_PATH: path.join(path.resolve("logs"), "api-errors.log"),

  /**
   * Default maximum log file size before rotation (in bytes).
   * @default 10 * 1024 * 1024 (10MB)
   */
  MAX_LOG_SIZE: 10 * 1024 * 1024,

  /**
   * Default interval in milliseconds to check for log rotation.
   * @default 1000 * 60 * 5 (5 minutes)
   */
  ROTATION_CHECK_INTERVAL: 1000 * 60 * 5,
};
