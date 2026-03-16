import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Auth enabled - users must sign in for interviews
const DISABLE_AUTH = false

const protectedPaths = ["/dashboard", "/interview"]

export function middleware(request: NextRequest) {
  // Skip auth checks if disabled
  if (DISABLE_AUTH) {
    return NextResponse.next()
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

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
