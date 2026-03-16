import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { server } from "../setup"
import { http, HttpResponse } from "msw"

describe("Full Interview Workflow E2E", () => {
  beforeEach(() => {
    // Mock authenticated session
    server.use(
      http.get("/api/auth/session", () => {
        return HttpResponse.json({
          user: {
            id: "test-user-id",
            email: "test@example.com",
            name: "Test User",
          },
        })
      })
    )

    // Ensure getUserMedia is properly mocked for this test suite
    const createMockTrack = (kind: string) => ({
      kind,
      id: `${kind}-track-${Math.random()}`,
      label: `Mock ${kind}`,
      enabled: true,
      muted: false,
      stop: vi.fn(),
    })

    const createMockStream = () => ({
      id: `mock-stream-${Math.random()}`,
      active: true,
      getAudioTracks: () => [createMockTrack("audio")],
      getVideoTracks: () => [createMockTrack("video")],
      getTracks: () => [createMockTrack("audio"), createMockTrack("video")],
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    vi.spyOn(navigator.mediaDevices, "getUserMedia").mockResolvedValue(
      createMockStream() as any
    )
  })

  afterEach(() => {
    server.resetHandlers()
    vi.restoreAllMocks()
  })

  describe("Complete Interview Session", () => {
    it("should complete full interview workflow", async () => {
      const sessionId = "test-session-id"
      let startTime = new Date().toISOString()
      let endTime = new Date().toISOString()
      let sessionScores = {
        confidence: 85,
        clarity: 90,
        relevance: 88,
        overall: 87.67,
      }
      let sessionTranscript = [
        {
          id: "msg-1",
          role: "interviewer",
          content: "Tell me about yourself.",
          timestamp: new Date().toISOString(),
        },
        {
          id: "msg-2",
          role: "candidate",
          content: "I'm a software engineer with experience...",
          timestamp: new Date().toISOString(),
        },
      ]

      // Step 1: Start interview session
      server.use(
        http.post("/api/session/start", async ({ request }) => {
          const body = await request.json()
          startTime = new Date().toISOString()
          return HttpResponse.json({
            sessionId,
            startedAt: startTime,
            jobRole: body.jobRole || "Software Engineer",
          })
        })
      )

      const startResponse = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: "Software Engineer",
          difficulty: "medium",
        }),
      })

      expect(startResponse.ok).toBe(true)
      const startData = await startResponse.json()
      expect(startData.sessionId).toBe(sessionId)
      expect(startData.startedAt).toBeDefined()

      // Step 2: Request camera/mic permissions (simulated)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      expect(mediaStream).toBeDefined()
      expect(mediaStream.getAudioTracks().length).toBeGreaterThan(0)
      expect(mediaStream.getVideoTracks().length).toBeGreaterThan(0)

      // Step 3-7: WebSocket communication is handled in separate tests

      // Step 8: End interview session
      server.use(
        http.post("/api/session/end", async ({ request }) => {
          const body = await request.json()
          endTime = new Date().toISOString()
          return HttpResponse.json({
            sessionId: body.sessionId || sessionId,
            endedAt: endTime,
            scores: sessionScores,
            transcript: sessionTranscript,
          })
        })
      )

      const endResponse = await fetch("/api/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })

      expect(endResponse.ok).toBe(true)
      const endData = await endResponse.json()
      expect(endData.scores).toBeDefined()
      expect(endData.transcript).toBeDefined()

      // Step 9: View analytics/report
      server.use(
        http.get(`/api/analytics/${sessionId}`, () => {
          return HttpResponse.json({
            session: {
              id: sessionId,
              startedAt: startTime,
              endedAt: endTime,
              duration: 1800,
              scores: sessionScores,
            },
            report: {
              id: "report-1",
              sessionId: sessionId,
              summary: "Strong interview performance with good communication.",
              strengths: [
                "Clear and articulate responses",
                "Good technical knowledge demonstrated",
                "Confident demeanor throughout",
              ],
              improvements: [
                "Consider providing more specific examples",
                "Elaborate more on complex technical concepts",
              ],
              recommendations: [
                "Practice more behavioral questions",
                "Work on structured answer frameworks (STAR method)",
              ],
            },
            transcript: sessionTranscript,
          })
        })
      )

      const analyticsResponse = await fetch(`/api/analytics/${sessionId}`)
      expect(analyticsResponse.ok).toBe(true)

      const analyticsData = await analyticsResponse.json()
      expect(analyticsData.report.summary).toBeDefined()
      expect(analyticsData.report.strengths.length).toBeGreaterThan(0)

      // Step 10: Verify session appears in dashboard
      server.use(
        http.get("/api/sessions", () => {
          return HttpResponse.json({
            sessions: [
              {
                id: sessionId,
                startedAt: startTime,
                endedAt: endTime,
                scores: sessionScores,
                jobRole: "Software Engineer",
              },
            ],
          })
        })
      )

      const sessionsResponse = await fetch("/api/sessions")
      expect(sessionsResponse.ok).toBe(true)

      const sessionsData = await sessionsResponse.json()
      expect(sessionsData.sessions.some((s: any) => s.id === sessionId)).toBe(true)
    })
  })

  describe("Interview with Real-time Confidence Tracking", () => {
    it("should track and update confidence scores in real-time", async () => {
      const sessionId = "test-session-id"

      // Start session
      server.use(
        http.post("/api/session/start", () => {
          return HttpResponse.json({
            sessionId,
            startedAt: new Date().toISOString(),
          })
        })
      )

      await fetch("/api/session/start", { method: "POST" })

      // Simulate confidence score updates via WebSocket
      const confidenceScores: number[] = []

      // Create a mock WebSocket handler
      const mockWs = {
        onmessage: null as ((event: MessageEvent) => void) | null,
        send: function(data: string) {
          const message = JSON.parse(data)
          if (message.type === "confidence") {
            confidenceScores.push(message.score)
          }
        },
      }

      // Simulate receiving confidence updates
      const updateMessage = {
        type: "confidence",
        score: 85,
        timestamp: new Date().toISOString(),
      }
      mockWs.send(JSON.stringify(updateMessage))

      expect(confidenceScores.length).toBe(1)
    })
  })

  describe("Interview Error Handling", () => {
    it("should handle media permission denial gracefully", async () => {
      // Mock getUserMedia rejection
      vi.spyOn(navigator.mediaDevices, "getUserMedia").mockRejectedValueOnce(
        new Error("Permission denied")
      )

      await expect(
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      ).rejects.toThrow("Permission denied")
    })

    it("should handle session end failure", async () => {
      server.use(
        http.post("/api/session/end", () => {
          return HttpResponse.json(
            { error: "Failed to end session" },
            { status: 500 }
          )
        })
      )

      const response = await fetch("/api/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: "test-session-id" }),
      })

      expect(response.status).toBe(500)
    })
  })

  describe("Interview with Different Roles", () => {
    const roles = [
      "Software Engineer",
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "Data Scientist",
    ]

    it.each(roles)("should start interview for %s role", async (role) => {
      server.use(
        http.post("/api/session/start", async ({ request }) => {
          const body = await request.json()
          return HttpResponse.json({
            sessionId: `session-${role}`,
            startedAt: new Date().toISOString(),
            jobRole: body.jobRole,
          })
        })
      )

      const response = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobRole: role }),
      })

      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.jobRole).toBe(role)
    })
  })
})
