import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { processInterviewResponse, createInterviewSession } from "@/lib/gemini"
import { handleCorsOptions, applyCorsHeaders } from "@/lib/cors"

function getDefaultQuestion(jobRole: string, difficulty: string): string {
  const questions: Record<
    string,
    { easy: string; medium: string; hard: string }
  > = {
    "Frontend Developer": {
      easy: "Can you tell me about your experience with HTML, CSS, and JavaScript?",
      medium:
        "Explain the difference between React useState and useEffect hooks. When would you use each?",
      hard: "How would you optimize a React application that has performance issues? Describe your debugging approach.",
    },
    "Backend Developer": {
      easy: "What programming languages are you most comfortable with?",
      medium:
        "Explain the difference between SQL and NoSQL databases. When would you choose one over the other?",
      hard: "Design a scalable API architecture for a high-traffic application. What considerations would you take?",
    },
    "Software Developer": {
      easy: "Tell me about your background in software development.",
      medium: "Describe your experience with version control systems like Git.",
      hard: "How do you approach debugging a complex issue in production?",
    },
  }

  const roleQuestions = questions[jobRole] || questions["Software Developer"]
  return (
    roleQuestions[difficulty as keyof typeof roleQuestions] ||
    roleQuestions.medium
  )
}

function getNextQuestion(jobRole: string): string {
  const followUpQuestions: Record<string, string[]> = {
    "Frontend Developer": [
      "What is your experience with state management libraries like Redux or Zustand?",
      "Can you explain the concept of virtual DOM in React?",
      "How do you handle routing in a React application?",
      "Describe your experience with CSS frameworks like Tailwind or Bootstrap.",
      "What testing libraries have you used for React components?",
    ],
    "Backend Developer": [
      "What is your experience with RESTful API design?",
      "Explain the concept of microservices architecture.",
      "How do you handle authentication and authorization in your applications?",
      "What database optimization techniques have you used?",
      "Describe your experience with cloud services like AWS or Azure.",
    ],
    "Software Developer": [
      "What is your approach to writing clean, maintainable code?",
      "How do you handle errors and exceptions in your applications?",
      "Describe your experience with agile development methodologies.",
      "What tools do you use for code reviews?",
      "How do you stay updated with new technologies?",
    ],
  }

  const questions =
    followUpQuestions[jobRole] || followUpQuestions["Software Developer"]
  return questions[Math.floor(Math.random() * questions.length)]
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request) || new NextResponse(null, { status: 200 })
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin")

  try {
    const body = await request.json()
    const {
      sessionId,
      userMessage,
      isFirstMessage = false,
      jobRole,
      difficulty,
      cvContent,
      jobDescription,
    } = body

    if (!sessionId || !userMessage) {
      const response = NextResponse.json(
        { error: "sessionId and userMessage are required" },
        { status: 400 }
      )
      return applyCorsHeaders(response, origin)
    }

    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: { transcripts: true },
    })

    if (!session) {
      const response = NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
      return applyCorsHeaders(response, origin)
    }

    const jobRoleToUse = session.jobRole || jobRole || "Software Developer"
    const difficultyToUse = session.difficulty || difficulty || "medium"
    const cvToUse = session.cvContent || cvContent || ""
    const jobDescToUse = session.jobDescription || jobDescription || ""

    let aiResponse: {
      feedback: string
      nextQuestion: string
    }

    if (isFirstMessage) {
      let result
      try {
        result = await createInterviewSession(
          jobRoleToUse,
          difficultyToUse as "easy" | "medium" | "hard",
          cvToUse,
          jobDescToUse
        )
      } catch (geminiError) {
        console.error("Gemini error:", geminiError)
        result = { success: false, error: String(geminiError) }
      }

      if (!result.success) {
        aiResponse = {
          feedback: "",
          nextQuestion: getDefaultQuestion(jobRoleToUse, difficultyToUse),
        }
      } else {
        aiResponse = {
          feedback: "",
          nextQuestion:
            result.message ||
            "Tell me about yourself and why you're interested in this role.",
        }
      }
    } else {
      const lastQuestionEntry = session.transcripts
        .filter((t: { role: string }) => t.role === "assistant")
        .pop()
      const lastQuestion =
        lastQuestionEntry?.content || "Tell me about yourself"

      let result
      try {
        result = await processInterviewResponse(
          userMessage,
          lastQuestion,
          jobRoleToUse,
          cvToUse,
          jobDescToUse
        )
      } catch (geminiError) {
        console.error("Gemini error:", geminiError)
        result = { success: false, error: String(geminiError) }
      }

      if (!result.success) {
        aiResponse = {
          feedback:
            "Good response! Try to provide more specific examples from your experience.",
          nextQuestion: getNextQuestion(jobRoleToUse),
        }
      } else {
        aiResponse = {
          feedback: result.feedback || "Good answer!",
          nextQuestion: result.nextQuestion || getNextQuestion(jobRoleToUse),
        }
      }
    }

    await prisma.transcript.create({
      data: {
        sessionId,
        role: "user",
        content: userMessage,
      },
    })

    await prisma.transcript.create({
      data: {
        sessionId,
        role: "assistant",
        content: aiResponse.feedback
          ? `Feedback: ${aiResponse.feedback}\n\nQuestion: ${aiResponse.nextQuestion}`
          : aiResponse.nextQuestion,
      },
    })

    const response = NextResponse.json({
      success: true,
      feedback: aiResponse.feedback,
      nextQuestion: aiResponse.nextQuestion,
    })

    return applyCorsHeaders(response, origin)
  } catch (error) {
    console.error("Error in chat:", error)
    const response = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
    return applyCorsHeaders(response, origin)
  }
}
