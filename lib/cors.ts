import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3007", // Playwright test port
  process.env.NEXT_PUBLIC_APP_URL || "",
].filter(Boolean)

/**
 * Apply CORS headers to a NextResponse
 */
export function applyCorsHeaders(
  response: NextResponse,
  origin?: string | null
): NextResponse {
  if (!origin) {
    return response
  }

  // Check if origin is allowed
  if (ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Credentials", "true")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  }

  return response
}

/**
 * Create a CORS preflight response
 */
export function createCorsPreflightResponse(origin?: string | null): NextResponse {
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return new NextResponse(null, { status: 403 })
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400", // 24 hours
    },
  })
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export function handleCorsOptions(request: NextRequest): NextResponse | null {
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("origin")
    return createCorsPreflightResponse(origin)
  }
  return null
}

/**
 * Wrap an API route handler with CORS support
 */
export function withCors<T>(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse<T>> => {
    // Handle preflight
    const preflightResponse = handleCorsOptions(request)
    if (preflightResponse) {
      return preflightResponse
    }

    // Call the actual handler
    const response = await handler(request, ...args)

    // Apply CORS headers to the response
    const origin = request.headers.get("origin")
    return applyCorsHeaders(response, origin)
  }
}
