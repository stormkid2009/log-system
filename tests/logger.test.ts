import fs from "fs";
import path from "path";
import {
  logInfo,
  logWarn,
  logError,
  setLoggerConfig,
  getLoggerConfig,
} from "../src";
import { LogLevel } from "../src/types";
import { writeQueue } from "../src/file-manager";

const LOG_FILE = path.join(__dirname, "test.log");

// Helper to clean up log file before/after tests
function cleanLogFile() {
  if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);
}

describe("Logger System", () => {
  beforeEach(() => {
    cleanLogFile();
    setLoggerConfig({
      format: "json",
      consoleOutput: false,
      formatOptions: {},
    });
  });
  afterAll(() => {
    cleanLogFile();
  });

  it("writes info log in JSON format", async () => {
    setLoggerConfig({ logDir: __dirname, logFilePath: LOG_FILE });
    await logInfo("Test info log");
    const content = fs.readFileSync(LOG_FILE, "utf8");
    expect(content).toContain("Test info log");
    expect(content).toContain("INFO");
  });

  it("writes warn log in text format", async () => {
    setLoggerConfig({
      format: "text",
      logDir: __dirname,
      logFilePath: LOG_FILE,
    });
    await logWarn("Test warn log");
    const content = fs.readFileSync(LOG_FILE, "utf8");
    expect(content).toContain("WARN: Test warn log");
  });

  it("writes error log in CSV format", async () => {
    setLoggerConfig({
      format: "csv",
      logDir: __dirname,
      logFilePath: LOG_FILE,
    });
    const err = new Error("CSV error");
    await logError("Test error log", err);
    const content = fs.readFileSync(LOG_FILE, "utf8");
    expect(content).toContain("ERROR");
    expect(content).toContain("CSV error");
  });

  it("outputs to console if enabled", async () => {
    setLoggerConfig({
      format: "text",
      consoleOutput: true,
      logDir: __dirname,
      logFilePath: LOG_FILE,
    });
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    await logInfo("Console output test");
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("Console output test")
    );
    spy.mockRestore();
  });

  it("respects per-call config override", async () => {
    setLoggerConfig({
      format: "json",
      logDir: __dirname,
      logFilePath: LOG_FILE,
    });
    await logInfo("Override to text", { format: "text" });
    const content = fs.readFileSync(LOG_FILE, "utf8");
    expect(content).toContain("INFO: Override to text");
  });
});

describe("Advanced Logger Features", () => {
  const ROTATE_LOG_FILE = path.join(__dirname, "rotate-test.log");
  const ROTATE_SIZE = 200; // bytes, very small for test

  beforeEach(() => {
    if (fs.existsSync(ROTATE_LOG_FILE)) fs.unlinkSync(ROTATE_LOG_FILE);
    // Remove any rotated files
    fs.readdirSync(__dirname)
      .filter(
        (f) =>
          f.startsWith("rotate-test") &&
          f.endsWith(".log") &&
          f !== "rotate-test.log"
      )
      .forEach((f) => fs.unlinkSync(path.join(__dirname, f)));
  });
  afterAll(() => {
    if (fs.existsSync(ROTATE_LOG_FILE)) fs.unlinkSync(ROTATE_LOG_FILE);
    fs.readdirSync(__dirname)
      .filter(
        (f) =>
          f.startsWith("rotate-test") &&
          f.endsWith(".log") &&
          f !== "rotate-test.log"
      )
      .forEach((f) => fs.unlinkSync(path.join(__dirname, f)));
  });

  it("rotates log file when maxLogSize is exceeded", async () => {
    setLoggerConfig({
      logDir: __dirname,
      logFilePath: ROTATE_LOG_FILE,
      maxLogSize: ROTATE_SIZE,
      rotationInterval: 0,
      format: "text",
    });
    // Write enough logs to exceed ROTATE_SIZE
    for (let i = 0; i < 20; i++) {
      await logInfo(`Log entry ${i}`);
    }
    // Check for rotated file
    const rotated = fs
      .readdirSync(__dirname)
      .find((f) => f.startsWith("rotate-test-") && f.endsWith(".log"));
    expect(rotated).toBeDefined();
    // Check new log file is not empty or check rotated file if main file does not exist
    let newLogContent = "";
    if (fs.existsSync(ROTATE_LOG_FILE)) {
      newLogContent = fs.readFileSync(ROTATE_LOG_FILE, "utf8");
      expect(newLogContent.length).toBeGreaterThan(0);
    } else {
      // If the file doesn't exist, check that at least one rotated file exists and is not empty
      const rotatedFiles = fs
        .readdirSync(__dirname)
        .filter((f) => f.startsWith("rotate-test-") && f.endsWith(".log"));
      expect(rotatedFiles.length).toBeGreaterThan(0);
      const rotatedContent = fs.readFileSync(
        path.join(__dirname, rotatedFiles[0]),
        "utf8"
      );
      expect(rotatedContent.length).toBeGreaterThan(0);
    }
  });

  it("handles concurrent log writes safely", async () => {
    setLoggerConfig({
      logDir: __dirname,
      logFilePath: ROTATE_LOG_FILE,
      format: "json",
      maxLogSize: ROTATE_SIZE, // ensure rotation may occur
    });
    const N = 50;
    await Promise.all(
      Array.from({ length: N }, (_, i) => logInfo(`Concurrent log ${i}`))
    );
    await writeQueue;
    // Optional: Add a short delay to ensure file system flush
    await new Promise((r) => setTimeout(r, 50));
    // Aggregate all log files (main + rotated)
    const files = fs
      .readdirSync(__dirname)
      .filter((f) => f.startsWith("rotate-test") && f.endsWith(".log"));
    let content = "";
    for (const file of files) {
      content += fs.readFileSync(path.join(__dirname, file), "utf8");
    }
    // Debug: Print the actual log content
    for (let i = 0; i < N; i++) {
      expect(content).toContain(`Concurrent log ${i}`);
    }
  });
});
