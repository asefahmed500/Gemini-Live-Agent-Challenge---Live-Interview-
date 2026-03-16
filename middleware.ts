import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Auth enabled - users must sign in for interviews
const DISABLE_AUTH = false

const protectedPaths = ["/dashboard", "/interview", "/profile", "/settings"]

// Allowed origins for CORS (WebSocket server on port 3001)
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3007",
  process.env.NEXT_PUBLIC_APP_URL || "",
].filter(Boolean)

export function middleware(request: NextRequest) {
  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("origin")

    if (ALLOWED_ORIGINS.includes(origin || "")) {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": origin || "",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      })
    }
  }

  // Add CORS headers to API responses
  const response = NextResponse.next()

  const origin = request.headers.get("origin")
  if (ALLOWED_ORIGINS.includes(origin || "")) {
    response.headers.set("Access-Control-Allow-Origin", origin || "")
    response.headers.set("Access-Control-Allow-Credentials", "true")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  }

  // Skip auth checks if disabled
  if (DISABLE_AUTH) {
    return response
  }

  const { pathname } = request.nextUrl

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  )
  const isAuthPath =
    pathname.startsWith("/login") || pathname.startsWith("/register")

  const sessionToken = request.cookies.get("better-auth.session_token")

  if (isProtectedPath && !sessionToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPath && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
