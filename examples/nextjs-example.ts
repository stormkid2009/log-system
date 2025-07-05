import { logApiError, extractRequestData } from "../src/index";

// Mock Next.js request for testing
class MockNextRequest {
  url: string;
  method: string;
  headers: Map<string, string>;

  constructor(url: string, method: string = "GET") {
    this.url = url;
    this.method = method;
    this.headers = new Map([
      ["content-type", "application/json"],
      ["user-agent", "Mozilla/5.0 (Next.js)"],
      ["x-forwarded-for", "192.168.1.1"],
      ["referer", "https://example.com"],
    ]);
  }
}

// Mock Headers class similar to Next.js
class MockHeaders {
  private headers: Map<string, string>;

  constructor(init?: Record<string, string>) {
    this.headers = new Map(Object.entries(init || {}));
  }

  forEach(callback: (value: string, key: string) => void) {
    this.headers.forEach(callback);
  }

  get(key: string) {
    return this.headers.get(key);
  }
}

async function nextjsExample() {
  console.log("⚡ Testing Next.js Integration...\n");

  try {
    // Test with Next.js style request
    const nextRequest = new MockNextRequest(
      "https://myapp.com/api/users/456?include=profile",
    );

    const routeError = new Error("Route not found");
    routeError.name = "RouteError";

    await logApiError("Next.js route error", routeError, {
      request: nextRequest as any,
      statusCode: 404,
    });

    console.log("✅ Next.js request logging - OK");

    // Test request data extraction
    const extractedData = extractRequestData(nextRequest as any);
    console.log("📊 Extracted request data:", {
      path: extractedData.path,
      method: extractedData.method,
      hasHeaders: Object.keys(extractedData.headers).length > 0,
      hasQuery: Object.keys(extractedData.query).length > 0,
    });

    console.log("✅ Request data extraction - OK");

    console.log("\n📁 Check the ./logs directory for generated log files");
    console.log("📄 Log file: ./logs/api-errors.log\n");
  } catch (error) {
    console.error("❌ Next.js integration test failed:", error);
  }
}

nextjsExample();
