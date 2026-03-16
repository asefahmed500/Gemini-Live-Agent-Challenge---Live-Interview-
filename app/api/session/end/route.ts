import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateInterviewReport } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      )
    }

    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: { confidenceLog: true, transcripts: true },
    })

    if (!interviewSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const confidenceLogs = interviewSession.confidenceLog
    let avgConfidence = 75
    let avgEyeContact = 75
    let avgVoiceTone = 75
    let avgSpeechClarity = 75

    if (confidenceLogs.length > 0) {
      avgConfidence =
        confidenceLogs.reduce(
          (sum, log) => sum + (log.overallConfidence || 75),
          0
        ) / confidenceLogs.length
      avgEyeContact =
        confidenceLogs.reduce((sum, log) => sum + (log.eyeContact || 75), 0) /
        confidenceLogs.length
      avgVoiceTone =
        confidenceLogs.reduce((sum, log) => sum + (log.voiceTone || 75), 0) /
        confidenceLogs.length
      avgSpeechClarity =
        confidenceLogs.reduce(
          (sum, log) => sum + (log.speechClarity || 75),
          0
        ) / confidenceLogs.length
    }

    // Generate AI report from transcripts
    const transcriptData = interviewSession.transcripts.map((t) => ({
      role: t.role,
      content: t.content,
    }))

    let aiReport = null
    try {
      aiReport = await generateInterviewReport(
        transcriptData,
        interviewSession.jobRole
      )
    } catch (aiError) {
      console.error("Error generating AI report:", aiError)
    }

    const communicationScore =
      (avgEyeContact + avgVoiceTone + avgSpeechClarity) / 3
    const technicalScore = aiReport?.scores?.technical || avgConfidence * 0.9
    const confidenceScore = aiReport?.scores?.confidence || avgConfidence

    const updatedSession = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: "completed",
        endedAt: new Date(),
        confidenceScore,
        communicationScore,
        technicalScore,
        overallScore:
          (communicationScore + technicalScore + confidenceScore) / 3,
      },
    })

    const report = await prisma.report.create({
      data: {
        sessionId: sessionId,
        communicationScore: updatedSession.communicationScore,
        technicalScore: updatedSession.technicalScore,
        confidenceScore: updatedSession.confidenceScore,
        overallScore: updatedSession.overallScore || 0,
        strengths:
          aiReport?.success && aiReport.strengths
            ? aiReport.strengths
            : ["Good communication", "Clear responses"],
        improvements:
          aiReport?.success && aiReport.improvements
            ? aiReport.improvements
            : ["Practice more questions", "Be more specific"],
        suggestions:
          aiReport?.success && aiReport.suggestions
            ? aiReport.suggestions
            : ["Review common interview questions", "Practice STAR method"],
        summary:
          aiReport?.success && aiReport.summary
            ? aiReport.summary
            : "Interview completed. Continue practicing to improve.",
        detailedFeedback:
          aiReport?.success && aiReport.detailedFeedback
            ? aiReport.detailedFeedback
            : `You completed the ${interviewSession.jobRole} interview. Focus on maintaining eye contact and providing structured answers using the STAR method.`,
      },
    })

    return NextResponse.json({
      sessionId: updatedSession.id,
      status: updatedSession.status,
      reportId: report.id,
    })
  } catch (error) {
    console.error("Error ending session:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
