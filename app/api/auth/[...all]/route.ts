import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"
import { NextRequest } from "next/server"
import { createCorsPreflightResponse, applyCorsHeaders } from "@/lib/cors"

// Get the Better Auth handlers
const authHandler = toNextJsHandler(auth)

// Wrap GET handler with CORS
export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin")

  // Handle preflight
  if (request.method === "OPTIONS") {
    return createCorsPreflightResponse(origin)
  }

  // Call the actual handler and apply CORS
  const response = await authHandler.GET(request as any)
  return applyCorsHeaders(response as any, origin)
}

// Wrap POST handler with CORS
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin")

  // Handle preflight
  if (request.method === "OPTIONS") {
    return createCorsPreflightResponse(origin)
  }

  // Call the actual handler and apply CORS
  const response = await authHandler.POST(request as any)
  return applyCorsHeaders(response as any, origin)
}
