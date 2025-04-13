/**
 * Helper functions for creating consistent error responses
 */

/**
 * Creates a 400 Bad Request error response
 */
export function createBadRequestError(message = "Bad request", details?: Record<string, unknown>): Response {
  return new Response(JSON.stringify({ message, details }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Creates a 401 Unauthorized error response
 */
export function createUnauthorizedError(message = "Unauthorized"): Response {
  return new Response(JSON.stringify({ message }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Creates a 404 Not Found error response
 */
export function createNotFoundError(message = "Resource not found"): Response {
  return new Response(JSON.stringify({ message }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Creates a 500 Internal Server Error response
 */
export function createServerError(message = "Internal server error"): Response {
  return new Response(JSON.stringify({ message }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}
