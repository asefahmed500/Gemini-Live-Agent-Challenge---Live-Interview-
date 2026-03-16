import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { handleCorsOptions, applyCorsHeaders } from "@/lib/cors"

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request) || new NextResponse(null, { status: 200 })
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin")

  try {
    // No auth check - get all sessions for demo
    const sessions = await prisma.interviewSession.findMany({
      orderBy: { startedAt: "desc" },
      take: 20,
    })

    const response = NextResponse.json({ sessions })
    return applyCorsHeaders(response, origin)
  } catch (error) {
    console.error("Error fetching sessions:", error)
    const response = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
    return applyCorsHeaders(response, origin)
  }
}
