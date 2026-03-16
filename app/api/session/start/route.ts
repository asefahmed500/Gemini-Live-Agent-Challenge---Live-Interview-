import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { randomBytes } from "crypto"

export async function POST(request: NextRequest) {
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
      return NextResponse.json(
        { error: "jobRole is required" },
        { status: 400 }
      )
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

    return NextResponse.json({
      sessionId: interviewSession.id,
      status: interviewSession.status,
      jobRole: interviewSession.jobRole,
      difficulty: interviewSession.difficulty,
      token,
    })
  } catch (error) {
    console.error("Error starting session:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
