/**
 * Simple WebSocket Server for Live Interview AI
 *
 * This server handles:
 * - Interview session start/end
 * - Mock AI responses for questions
 * - Mock confidence scoring
 *
 * Run with: npx tsx server/ws-server.ts
 */

import { WebSocketServer, WebSocket } from "ws"
import { createInterviewSession } from "../lib/gemini"

const PORT = parseInt(process.env.WS_PORT || "3001")

interface ClientMessage {
  type: "control" | "audio" | "video"
  action?: "start" | "stop" | "pause"
  sessionId?: string
  timestamp?: number
  data?: unknown
}

interface ServerMessage {
  type: "transcript" | "confidence" | "audio" | "control"
  role?: "user" | "assistant" | "system"
  content?: string
  confidence?: number
  sessionId?: string
  timestamp?: number
  metrics?: {
    eyeContact: number
    posture: number
    facialExpression: number
    voiceTone: number
    speechClarity: number
    overall: number
  }
}

const wss = new WebSocketServer({ port: PORT })

console.log(`🚀 WebSocket server running on ws://localhost:${PORT}`)

// Store active sessions
const sessions = new Map<
  string,
  {
    status: "active" | "ended"
    startTime: number
    questionCount: number
  }
>()

wss.on("connection", (ws: WebSocket) => {
  console.log("✅ New client connected")

  // Send a welcome message
  ws.send(
    JSON.stringify({
      type: "control",
      message: "Connected to Live Interview AI Server",
      timestamp: Date.now(),
    } as ServerMessage)
  )

  ws.on("message", async (data: Buffer) => {
    try {
      const message: ClientMessage = JSON.parse(data.toString())
      console.log("📩 Received:", message.type, message.action)

      switch (message.type) {
        case "control":
          if (message.action === "start" && message.sessionId) {
            // Start interview session
            sessions.set(message.sessionId, {
              status: "active",
              startTime: Date.now(),
              questionCount: 0,
            })

            // Generate first AI question using Gemini
            const response = await createInterviewSession(
              "Frontend Developer",
              "medium"
            )

            if (response.success) {
              // Simulate AI asking the first question
              setTimeout(() => {
                ws.send(
                  JSON.stringify({
                    type: "transcript",
                    role: "assistant",
                    content: response.message,
                    timestamp: Date.now(),
                  } as ServerMessage)
                )
              }, 1000)
            }

            // Start sending mock confidence updates
            sendMockConfidenceUpdates(ws, message.sessionId)
          } else if (message.action === "stop" && message.sessionId) {
            // End interview session
            const session = sessions.get(message.sessionId)
            if (session) {
              session.status = "ended"
            }
            console.log(`🛑 Session ${message.sessionId} ended`)
          }
          break

        case "audio":
          // Process user audio (mock response)
          if (message.sessionId) {
            const session = sessions.get(message.sessionId)
            if (session?.status === "active") {
              // Mock AI response after user speaks
              session.questionCount++

              // In a real implementation, this would use speech-to-text
              // and process the user's actual response
              setTimeout(() => {
                const mockQuestions = [
                  "Can you tell me about a challenging project you've worked on?",
                  "How do you handle tight deadlines?",
                  "Describe your experience with React hooks.",
                  "What's your approach to debugging?",
                  "How do you stay updated with new technologies?",
                ]

                const question =
                  mockQuestions[
                    Math.floor(Math.random() * mockQuestions.length)
                  ]

                ws.send(
                  JSON.stringify({
                    type: "transcript",
                    role: "assistant",
                    content: `Thanks for your response. ${question}`,
                    timestamp: Date.now(),
                  } as ServerMessage)
                )
              }, 2000)
            }
          }
          break

        case "video":
          // Process video frames for vision analysis (mock response)
          // In real implementation, this would analyze the video for confidence metrics
          break
      }
    } catch (error) {
      console.error("❌ Error processing message:", error)
    }
  })

  ws.on("close", () => {
    console.log("❌ Client disconnected")
  })

  ws.on("error", (error) => {
    console.error("❌ WebSocket error:", error)
  })
})

// Send mock confidence updates every 2 seconds
function sendMockConfidenceUpdates(ws: WebSocket, sessionId: string) {
  const interval = setInterval(() => {
    const session = sessions.get(sessionId)
    if (!session || session.status === "ended") {
      clearInterval(interval)
      return
    }

    const metrics = {
      eyeContact: 70 + Math.random() * 20,
      posture: 75 + Math.random() * 15,
      facialExpression: 65 + Math.random() * 25,
      voiceTone: 70 + Math.random() * 20,
      speechClarity: 72 + Math.random() * 18,
      overall: 70 + Math.random() * 20,
    }

    ws.send(
      JSON.stringify({
        type: "confidence",
        sessionId,
        timestamp: Date.now(),
        metrics,
      } as ServerMessage)
    )
  }, 2000)
}

wss.on("error", (error) => {
  console.error("❌ Server error:", error)
})

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down WebSocket server...")
  wss.close(() => {
    console.log("✅ Server closed")
    process.exit(0)
  })
})
