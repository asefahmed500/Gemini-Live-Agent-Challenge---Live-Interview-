import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { randomBytes } from "crypto"
import { handleCorsOptions, applyCorsHeaders } from "@/lib/cors"

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request) || new NextResponse(null, { status: 200 })
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin")

  try {
    const body = await request.json()
    const {
      jobRole,
      difficulty = "medium",
      cvContent = "",
      jobDescription = "",
      interviewType = "chat",
    } = body

    if (!jobRole) {
      const response = NextResponse.json(
        { error: "jobRole is required" },
        { status: 400 }
      )
      return applyCorsHeaders(response, origin)
    }

    // Create interview session
    const interviewSession = await prisma.interviewSession.create({
      data: {
        jobRole,
        difficulty,
        status: "active",
        cvContent,
        jobDescription,
        interviewType,
      },
    })

    // Generate token
    const token = randomBytes(32).toString("hex")

    const response = NextResponse.json({
      sessionId: interviewSession.id,
      status: interviewSession.status,
      jobRole: interviewSession.jobRole,
      difficulty: interviewSession.difficulty,
      token,
    })

    return applyCorsHeaders(response, origin)
  } catch (error) {
    console.error("Error starting session:", error)
    const response = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
    return applyCorsHeaders(response, origin)
  }
}
