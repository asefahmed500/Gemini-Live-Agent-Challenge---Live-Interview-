import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { handleCorsOptions, applyCorsHeaders } from "@/lib/cors"

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request) || new NextResponse(null, { status: 200 })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ session_id: string }> }
) {
  const origin = request.headers.get("origin")

  try {
    // No auth check - allow guest access
    const { session_id: sessionId } = await params

    // Get session with all related data
    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        transcripts: {
          orderBy: { timestamp: "asc" },
        },
        confidenceLog: {
          orderBy: { timestamp: "asc" },
        },
        report: true,
      },
    })

    if (!interviewSession) {
      const response = NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
      return applyCorsHeaders(response, origin)
    }

    const response = NextResponse.json({
      sessionId: interviewSession.id,
      jobRole: interviewSession.jobRole,
      difficulty: interviewSession.difficulty,
      status: interviewSession.status,
      startedAt: interviewSession.startedAt,
      endedAt: interviewSession.endedAt,
      scores: {
        overall: interviewSession.overallScore,
        confidence: interviewSession.confidenceScore,
        communication: interviewSession.communicationScore,
        technical: interviewSession.technicalScore,
      },
      transcripts: interviewSession.transcripts,
      confidenceLog: interviewSession.confidenceLog,
      report: interviewSession.report,
    })

    return applyCorsHeaders(response, origin)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    const response = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
    return applyCorsHeaders(response, origin)
  }
}
