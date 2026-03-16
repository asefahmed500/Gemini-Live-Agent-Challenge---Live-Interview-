import { GoogleGenerativeAI } from "@google/generative-ai"

const API_KEY = process.env.GEMINI_API_KEY || ""

if (!API_KEY) {
  console.warn("GEMINI_API_KEY is not set")
}

const genAI = new GoogleGenerativeAI(API_KEY)

function buildPersonalizedSystemPrompt(
  jobRole: string,
  cvContent: string,
  jobDescription: string,
  difficulty: "easy" | "medium" | "hard"
): string {
  let prompt = `You are an AI Interview Coach conducting a personalized mock job interview for a ${jobRole} position. `

  // Add CV information if provided
  if (cvContent && cvContent.trim()) {
    prompt += `\n\nThe candidate's background and experience:\n${cvContent}\n`
  }

  // Add job description if provided
  if (jobDescription && jobDescription.trim()) {
    prompt += `\n\nThe target job description:\n${jobDescription}\n`
  }

  prompt += `\nYour role is to:
1. Ask relevant interview questions based on BOTH the candidate's background (from their CV) AND the job requirements
2. Focus on skills and experiences that match the job description
3. Probe deeper into areas where the candidate has experience
4. Provide constructive feedback on:
   - Content quality and technical accuracy
   - Communication clarity and structure
   - Confidence and delivery
5. Ask follow-up questions to probe deeper into their experience
6. Maintain a professional yet encouraging demeanor

Guidelines:
- Start with a brief introduction and then ask the first question
- Reference the candidate's specific experience when asking questions
- Give candidates time to think (wait 2-3 seconds before responding)
- Be specific in your feedback - relate it to their actual experience
- Balance critique with encouragement
- Adapt difficulty based on the ${difficulty} level and performance
- Keep responses concise (1-2 sentences per feedback)
- At the end, provide a summary of strengths and areas for improvement

At the end of the interview, provide a comprehensive report with specific examples from their responses.`

  return prompt
}

export async function createInterviewSession(
  jobRole: string,
  difficulty: "easy" | "medium" | "hard",
  cvContent?: string,
  jobDescription?: string
) {
  try {
    const systemPrompt = buildPersonalizedSystemPrompt(
      jobRole,
      cvContent || "",
      jobDescription || "",
      difficulty
    )

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: systemPrompt,
    })

    const difficultyGuide = {
      easy: "basic concepts and introductory questions",
      medium: "standard interview questions with some depth",
      hard: "advanced technical questions and complex scenarios",
    }

    let prompt = `Start a ${difficulty} interview for a ${jobRole} position.`

    if (cvContent && cvContent.trim()) {
      prompt += `\n\nBased on the candidate's CV: ${cvContent.substring(0, 500)}...`
    }

    if (jobDescription && jobDescription.trim()) {
      prompt += `\n\nJob requirements: ${jobDescription.substring(0, 500)}...`
    }

    prompt += `\n\nBegin with a warm introduction and then ask the first ${difficultyGuide[difficulty]} question. Make it relevant to their background. Keep your response under 30 seconds when spoken.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return {
      success: true,
      message: text,
    }
  } catch (error) {
    console.error("Error creating interview session:", error)
    return {
      success: false,
      error: "Failed to create interview session",
    }
  }
}

export async function processInterviewResponse(
  userResponse: string,
  question: string,
  jobRole: string,
  cvContent?: string,
  jobDescription?: string
) {
  try {
    const systemPrompt = buildPersonalizedSystemPrompt(
      jobRole,
      cvContent || "",
      jobDescription || "",
      "medium"
    )

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: systemPrompt,
    })

    let prompt = `The candidate is interviewing for a ${jobRole} position.`

    if (cvContent && cvContent.trim()) {
      prompt += `\n\nCandidate's background:\n${cvContent.substring(0, 300)}...`
    }

    prompt += `

Previous question: "${question}"

Candidate's response: "${userResponse}"

Provide:
1. Brief feedback on their response (1-2 sentences) - relate it to their experience if possible
2. The next interview question - make it relevant to their background

Format your response as:
FEEDBACK: [your feedback]
QUESTION: [next question]`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the response
    const feedbackMatch = text.match(/FEEDBACK:\s*(.+?)(?=QUESTION:|$)/s)
    const questionMatch = text.match(/QUESTION:\s*(.+)$/s)

    return {
      success: true,
      feedback: feedbackMatch?.[1]?.trim() || "",
      nextQuestion: questionMatch?.[1]?.trim() || "",
    }
  } catch (error) {
    console.error("Error processing interview response:", error)
    return {
      success: false,
      error: "Failed to process response",
    }
  }
}

export async function generateInterviewReport(
  transcripts: Array<{ role: string; content: string }>,
  jobRole: string
) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    })

    const prompt = `Analyze the following interview transcript for a ${jobRole} position and provide a comprehensive report.

Transcript:
${transcripts.map((t) => `${t.role.toUpperCase()}: ${t.content}`).join("\n\n")}

Provide a JSON response with this structure:
{
  "strengths": ["strength1", "strength2", ...],
  "improvements": ["improvement1", "improvement2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "summary": "Brief overall summary",
  "detailedFeedback": "Detailed feedback on performance",
  "scores": {
    "communication": 0-100,
    "technical": 0-100,
    "confidence": 0-100
  }
}

Only respond with valid JSON.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return { success: true, ...parsed }
    }

    // Fallback if JSON parsing fails
    return {
      success: true,
      strengths: ["Good communication skills"],
      improvements: ["Consider providing more specific examples"],
      suggestions: ["Practice behavioral questions"],
      summary: "Interview completed",
      detailedFeedback: text,
    }
  } catch (error) {
    console.error("Error generating report:", error)
    return {
      success: false,
      error: "Failed to generate report",
    }
  }
}

export { genAI }
