import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ session_id: string }> }
) {
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
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // No ownership check - allow guest access to any session

    return NextResponse.json({
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
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
