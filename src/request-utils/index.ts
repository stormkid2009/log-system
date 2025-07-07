/**
 * Request Utilities Module
 *
 * Provides utility functions for extracting and processing HTTP request data.
 * Designed to work with both Next.js requests and standard Request objects,
 * with built-in security measures to handle sensitive information appropriately.
 *
 * @module request-utils
 */

/**
 * Represents a simplified HTTP request object with essential properties.
 * This interface is designed to be compatible with various request types.
 *
 * @interface ApiRequestData
 * @property {string} url - The request URL
 * @property {string} method - The HTTP method (e.g., 'GET', 'POST')
 * @property {Record<string, string> | Headers} headers - Request headers
 */
export interface ApiRequestData {
  url: string;
  method: string;
  headers: Record<string, string> | Headers;
}

/**
 * Extracts and processes relevant information from a request object.
 * Handles both standard Request objects and custom ApiRequestData objects.
 *
 * @param {ApiRequestData | Request} request - The request object to process
 * @returns {Object} An object containing the extracted request data
 * @property {string} path - The request path
 * @property {string} method - The HTTP method
 * @property {Record<string, string>} headers - Filtered request headers (only includes important headers)
 * @property {Record<string, string>} query - URL query parameters
 *
 * @example
 * // With a standard Request object
 * const data = extractRequestData(request);
 * // { path: '/api/users', method: 'GET', headers: {...}, query: {...} }
 *
 * @example
 * // With a custom ApiRequestData object
 * const data = extractRequestData({
 *   url: 'https://example.com/api/users?page=1',
 *   method: 'GET',
 *   headers: { 'user-agent': 'Mozilla/5.0', 'authorization': 'Bearer token' }
 * });
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
