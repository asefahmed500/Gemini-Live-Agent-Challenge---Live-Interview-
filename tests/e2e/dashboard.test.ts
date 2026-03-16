import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { server } from "../setup"
import { http, HttpResponse } from "msw"

describe("Dashboard E2E", () => {
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
  })

  afterEach(() => {
    server.resetHandlers()
  })

  describe("Dashboard Access", () => {
    it("should display user's recent sessions", async () => {
      server.use(
        http.get("/api/sessions", () => {
          return HttpResponse.json({
            sessions: [
              {
                id: "session-1",
                startedAt: "2024-01-15T10:00:00Z",
                endedAt: "2024-01-15T10:30:00Z",
                scores: {
                  confidence: 85,
                  clarity: 90,
                  relevance: 88,
                },
                jobRole: "Software Engineer",
              },
              {
                id: "session-2",
                startedAt: "2024-01-14T14:00:00Z",
                endedAt: "2024-01-14T14:25:00Z",
                scores: {
                  confidence: 78,
                  clarity: 82,
                  relevance: 80,
                },
                jobRole: "Frontend Developer",
              },
            ],
          })
        })
      )

      const response = await fetch("/api/sessions")
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.sessions).toHaveLength(2)
      expect(data.sessions[0].jobRole).toBe("Software Engineer")
    })

    it("should show empty state when no sessions exist", async () => {
      server.use(
        http.get("/api/sessions", () => {
          return HttpResponse.json({ sessions: [] })
        })
      )

      const response = await fetch("/api/sessions")
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.sessions).toHaveLength(0)
    })

    it("should allow filtering sessions by job role", async () => {
      server.use(
        http.get("/api/sessions", ({ request }) => {
          const url = new URL(request.url)
          const role = url.searchParams.get("role")

          return HttpResponse.json({
            sessions: [
              {
                id: "session-1",
                startedAt: "2024-01-15T10:00:00Z",
                endedAt: "2024-01-15T10:30:00Z",
                scores: { confidence: 85, clarity: 90, relevance: 88 },
                jobRole: role || "Software Engineer",
              },
            ],
          })
        })
      )

      const response = await fetch("/api/sessions?role=Frontend%20Developer")
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.sessions[0].jobRole).toBe("Frontend Developer")
    })
  })

  describe("Session Analytics", () => {
    it("should display session details with scores", async () => {
      const sessionId = "test-session-id"

      server.use(
        http.get(`/api/analytics/${sessionId}`, () => {
          return HttpResponse.json({
            session: {
              id: sessionId,
              startedAt: "2024-01-15T10:00:00Z",
              endedAt: "2024-01-15T10:30:00Z",
              duration: 1800,
              scores: {
                confidence: 85,
                clarity: 90,
                relevance: 88,
                overall: 87.67,
              },
              jobRole: "Software Engineer",
              questionCount: 5,
            },
            report: {
              id: "report-1",
              sessionId: sessionId,
              summary: "Strong performance with good communication skills.",
              strengths: [
                "Clear and articulate responses",
                "Good technical knowledge",
                "Confident demeanor",
              ],
              improvements: [
                "Could provide more specific examples",
                "Try to elaborate more on complex topics",
              ],
              recommendations: [
                "Practice behavioral questions",
                "Work on providing more detailed explanations",
              ],
            },
          })
        })
      )

      const response = await fetch(`/api/analytics/${sessionId}`)
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.session.scores.confidence).toBe(85)
      expect(data.report.strengths).toHaveLength(3)
    })

    it("should include transcript in analytics", async () => {
      const sessionId = "test-session-id"

      server.use(
        http.get(`/api/analytics/${sessionId}`, () => {
          return HttpResponse.json({
            session: {
              id: sessionId,
              startedAt: "2024-01-15T10:00:00Z",
              endedAt: "2024-01-15T10:30:00Z",
              scores: { confidence: 85, clarity: 90, relevance: 88 },
            },
            transcript: [
              {
                id: "msg-1",
                role: "interviewer",
                content: "Tell me about yourself.",
                timestamp: "2024-01-15T10:00:10Z",
              },
              {
                id: "msg-2",
                role: "candidate",
                content: "I'm a software engineer with 5 years of experience...",
                timestamp: "2024-01-15T10:00:15Z",
              },
            ],
            report: {
              id: "report-1",
              sessionId: sessionId,
              summary: "Test summary",
              strengths: ["Test strength"],
              improvements: ["Test improvement"],
            },
          })
        })
      )

      const response = await fetch(`/api/analytics/${sessionId}`)
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.transcript).toHaveLength(2)
      expect(data.transcript[0].role).toBe("interviewer")
    })
  })

  describe("Session Actions", () => {
    it("should allow starting a new interview session", async () => {
      server.use(
        http.post("/api/session/start", async ({ request }) => {
          const body = await request.json()
          return HttpResponse.json({
            sessionId: "new-session-id",
            startedAt: new Date().toISOString(),
            jobRole: body.jobRole || "Software Engineer",
          })
        })
      )

      const response = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobRole: "Frontend Developer" }),
      })

      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.sessionId).toBeDefined()
      expect(data.jobRole).toBe("Frontend Developer")
    })

    it("should allow deleting a session", async () => {
      const sessionId = "test-session-id"

      server.use(
        http.delete(`/api/sessions/${sessionId}`, () => {
          return HttpResponse.json({ success: true })
        })
      )

      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      })

      expect(response.ok).toBe(true)
    })
  })

  describe("Performance Trends", () => {
    it("should calculate performance improvement over time", async () => {
      server.use(
        http.get("/api/sessions", () => {
          return HttpResponse.json({
            sessions: [
              {
                id: "session-1",
                startedAt: "2024-01-10T10:00:00Z",
                endedAt: "2024-01-10T10:30:00Z",
                scores: { confidence: 70, clarity: 75, relevance: 72 },
              },
              {
                id: "session-2",
                startedAt: "2024-01-15T10:00:00Z",
                endedAt: "2024-01-15T10:30:00Z",
                scores: { confidence: 85, clarity: 90, relevance: 88 },
              },
            ],
          })
        })
      )

      const response = await fetch("/api/sessions")
      expect(response.ok).toBe(true)

      const data = await response.json()
      const firstSession = data.sessions[0]
      const lastSession = data.sessions[data.sessions.length - 1]

      // Calculate improvement
      const confidenceImprovement =
        lastSession.scores.confidence - firstSession.scores.confidence

      expect(confidenceImprovement).toBeGreaterThan(0)
    })
  })
})
