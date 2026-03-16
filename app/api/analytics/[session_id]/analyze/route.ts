import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ session_id: string }> }
) {
  try {
    const { session_id: sessionId } = await params
    const body = await request.json()

    const { facialAnalysis, speechAnalysis, confidenceLogs } = body

    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        transcripts: {
          orderBy: { timestamp: "asc" },
        },
        confidenceLog: {
          orderBy: { timestamp: "asc" },
        },
      },
    })

    if (!interviewSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const analysisPrompt = `
You are an expert interview coach and behavioral analyst. Analyze the following interview session and provide comprehensive feedback.

## Session Details
- Job Role: ${interviewSession.jobRole}
- Difficulty: ${interviewSession.difficulty}

## Transcript
${interviewSession.transcripts.map((t) => `${t.role}: ${t.content}`).join("\n")}

## Facial Analysis Data
${JSON.stringify(facialAnalysis || {}, null, 2)}

## Speech Analysis Data
${JSON.stringify(speechAnalysis || {}, null, 2)}

## Confidence Logs
${JSON.stringify(confidenceLogs || [], null, 2)}

Please provide a detailed analysis with the following structure:
1. Overall Score (0-100)
2. Strengths (array of strings)
3. Areas for Improvement (array of strings) 
4. Specific Recommendations (array of strings)
5. Detailed Feedback (paragraph)
6. Key Observations (array of strings about specific moments)
7. Body Language Analysis
8. Communication Style Assessment

Format your response as a JSON object with these exact keys:
{
  "overallScore": number,
  "communicationScore": number,
  "confidenceScore": number,
  "technicalScore": number,
  "strengths": string[],
  "improvements": string[],
  "suggestions": string[],
  "summary": string,
  "detailedFeedback": string,
  "keyObservations": string[],
  "bodyLanguage": {
    "eyeContact": string,
    "posture": string,
    "expressions": string,
    "overall": string
  },
  "communicationStyle": {
    "clarity": string,
    "pace": string,
    "tone": string,
    "overall": string
  }
}
`

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })
    const result = await model.generateContent(analysisPrompt)
    const response = result.response.text()

    let parsedAnalysis: Record<string, unknown> = {}
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedAnalysis = JSON.parse(jsonMatch[0])
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      parsedAnalysis = generateFallbackAnalysis(interviewSession)
    }

    const existingReport = await prisma.report.findUnique({
      where: { sessionId },
    })

    const reportData = {
      sessionId,
      overallScore: Number(parsedAnalysis.overallScore) || 75,
      communicationScore: Number(parsedAnalysis.communicationScore) || 75,
      confidenceScore: Number(parsedAnalysis.confidenceScore) || 75,
      technicalScore: Number(parsedAnalysis.technicalScore) || 75,
      strengths: Array.isArray(parsedAnalysis.strengths)
        ? (parsedAnalysis.strengths as string[])
        : [],
      improvements: Array.isArray(parsedAnalysis.improvements)
        ? (parsedAnalysis.improvements as string[])
        : [],
      suggestions: Array.isArray(parsedAnalysis.suggestions)
        ? (parsedAnalysis.suggestions as string[])
        : [],
      summary:
        String(parsedAnalysis.summary) || "Interview completed successfully.",
      detailedFeedback:
        String(parsedAnalysis.detailedFeedback) ||
        "The candidate demonstrated reasonable communication skills.",
    }

    let report
    if (existingReport) {
      report = await prisma.report.update({
        where: { sessionId },
        data: reportData,
      })
    } else {
      report = await prisma.report.create({
        data: reportData,
      })
    }

    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        overallScore: reportData.overallScore,
        confidenceScore: reportData.confidenceScore,
        communicationScore: reportData.communicationScore,
        technicalScore: reportData.technicalScore,
      },
    })

    return NextResponse.json({
      report,
      analysis: {
        bodyLanguage: parsedAnalysis.bodyLanguage as
          | Record<string, string>
          | undefined,
        communicationStyle: parsedAnalysis.communicationStyle as
          | Record<string, string>
          | undefined,
        keyObservations: Array.isArray(parsedAnalysis.keyObservations)
          ? (parsedAnalysis.keyObservations as string[])
          : [],
      },
    })
  } catch (error) {
    console.error("Error generating analysis:", error)
    return NextResponse.json(
      { error: "Failed to generate analysis" },
      { status: 500 }
    )
  }
}

interface SessionData {
  transcripts: Array<{ role: string }>
  confidenceLog: Array<{ overallConfidence: number | null }>
}

function generateFallbackAnalysis(session: SessionData) {
  const avgConfidence =
    session.confidenceLog?.reduce(
      (acc, log) => acc + (log.overallConfidence || 0),
      0
    ) / (session.confidenceLog?.length || 1) || 70

  return {
    overallScore: Math.round(avgConfidence),
    communicationScore: Math.round(avgConfidence * 0.95),
    confidenceScore: Math.round(avgConfidence),
    technicalScore: Math.round(avgConfidence * 0.9),
    strengths: [
      "Completed the interview successfully",
      "Engaged with interview questions",
    ],
    improvements: [
      "Practice maintaining consistent eye contact",
      "Work on reducing filler words",
    ],
    suggestions: [
      "Practice with mock interviews",
      "Review common interview questions",
      "Record yourself and review",
    ],
    summary: "Interview completed. General feedback provided.",
    detailedFeedback:
      "The candidate completed the interview. More detailed analysis requires additional data.",
    bodyLanguage: {
      eyeContact: "Unable to analyze",
      posture: "Unable to analyze",
      expressions: "Unable to analyze",
      overall: "Data not available",
    },
    communicationStyle: {
      clarity: "Good",
      pace: "Moderate",
      tone: "Professional",
      overall: "Satisfactory",
    },
    keyObservations: ["Interview completed"],
  }
}
