// Interface now includes url and headers can be Record or Headers
// name changed from extractors to request-utils
// request-utils/index.ts
// This file contains utility functions for extracting request data from Next.js requests.
// It is designed to work with both NextRequest and standard Request objects.

export interface ApiRequestData {
  url: string;
  method: string;
  headers: Record<string, string> | Headers;
}

/**
 * Extract relevant information from a NextRequest or standard Request object
 *
 * @param request - The request object
 * @returns Object containing extracted request data
 */
export function extractRequestData(request: ApiRequestData | Request) {
  try {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    // Extract headers (limited set for security/privacy)
    const headers: Record<string, string> = {};
    const importantHeaders = [
      "content-type",
      "user-agent",
      "referer",
      "x-request-id",
      "x-correlation-id",
      "x-forwarded-for",
    ];

    // Support both Headers and plain object
    if (typeof (request.headers as any).forEach === "function") {
      (request.headers as Headers).forEach((value, key) => {
        if (importantHeaders.includes(key.toLowerCase())) {
          headers[key] = value;
        }
      });
    } else {
      Object.entries(request.headers).forEach(([key, value]) => {
        if (importantHeaders.includes(key.toLowerCase())) {
          headers[key] = value;
        }
      });
    }

    // Extract search params
    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    return {
      path,
      method,
      headers,
      query,
    };
  } catch (error) {
    console.error("Failed to extract request data:", error);
    return {
      path: "unknown",
      method: "unknown",
      headers: {},
      query: {},
    };
  }
}
