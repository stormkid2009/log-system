import {
  logInfo,
  logWarn,
  logError,
  LogLevel,
  setLoggerConfig,
} from "../src/index";

setLoggerConfig({
  format: "text",
  consoleOutput: true,
});

async function basicUsageExample() {
  console.log("🚀 Testing Basic Logging Functions...\n");

  try {
    // Test info logging
    await logInfo("Application started successfully");
    console.log("✅ Info logging - OK");

    // Test warning logging
    await logWarn("This is a warning message", {
      component: "BasicExample",
      timestamp: new Date().toISOString(),
    });
    console.log("✅ Warning logging - OK");

    // Test error logging
    const testError = new Error("This is a test error");
    await logError("Test error occurred", testError);
    console.log("✅ Error logging - OK");

    console.log("\n📁 Check the ./logs directory for generated log files");
    console.log("📄 Log file: ./logs/api-errors.log\n");
  } catch (error) {
    console.error("❌ Basic usage test failed:", error);
  }
}

async function csvUsageExample() {
  console.log("\n--- Switching to CSV format ---\n");
  setLoggerConfig({
    format: "csv",
    consoleOutput: true,
  });

  await logInfo("Application started successfully (CSV)");
  await logWarn("This is a warning message (CSV)", {
    component: "BasicExample",
    timestamp: new Date().toISOString(),
  });
  const testError = new Error("This is a test error (CSV)");
  await logError("Test error occurred (CSV)", testError);
}

basicUsageExample().then(csvUsageExample);
