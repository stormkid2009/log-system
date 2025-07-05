import { logApiError } from "../src/index";

// Mock request object for testing
const mockRequest = {
  url: "https://api.example.com/users/123?sort=name&limit=10",
  method: "GET",
  headers: {
    "content-type": "application/json",
    "user-agent": "TestClient/1.0",
    authorization: "Bearer token123", // This should be filtered out
    "x-request-id": "req-123-456",
  },
};

async function apiErrorExample() {
  console.log("🔥 Testing API Error Logging...\n");

  try {
    // Simulate database error
    const dbError = new Error("Connection timeout");
    dbError.name = "DatabaseError";

    await logApiError("Database connection failed", dbError, {
      request: mockRequest,
      statusCode: 500,
      params: { userId: "123" },
      requestBody: { action: "update", data: { name: "John" } },
    });

    console.log("✅ API error logging with full context - OK");

    // Simulate validation error
    const validationError = new Error("Invalid email format");
    validationError.name = "ValidationError";

    await logApiError("Request validation failed", validationError, {
      path: "/api/users",
      method: "POST",
      statusCode: 400,
      requestBody: { email: "invalid-email" },
    });

    console.log("✅ API error logging with minimal context - OK");

    console.log("\n📁 Check the ./logs directory for generated log files");
    console.log("📄 Log file: ./logs/api-errors.log\n");
  } catch (error) {
    console.error("❌ API error test failed:", error);
  }
}

apiErrorExample();
