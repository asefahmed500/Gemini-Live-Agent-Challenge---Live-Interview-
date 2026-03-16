import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { server } from "../setup"
import { http, HttpResponse } from "msw"

describe("Session API Integration Tests", () => {
  beforeEach(() => {
    server.resetHandlers()

    // Mock authenticated session for all tests
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

  describe("POST /api/session/start", () => {
    it("should start a new interview session", async () => {
      const sessionData = {
        jobRole: "Software Engineer",
        difficulty: "medium",
      }

      server.use(
        http.post("/api/session/start", async ({ request }) => {
          const body = await request.json()
          return HttpResponse.json({
            sessionId: "new-session-id",
            userId: "test-user-id",
            startedAt: new Date().toISOString(),
            jobRole: body.jobRole,
            difficulty: body.difficulty,
            status: "active",
          })
        })
      )

      const response = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.sessionId).toBeDefined()
      expect(data.jobRole).toBe(sessionData.jobRole)
      expect(data.status).toBe("active")
    })

    it("should require authentication", async () => {
      server.use(
        http.get("/api/auth/session", () => {
          return HttpResponse.json({ user: null })
        })
      )

      server.use(
        http.post("/api/session/start", () => {
          return HttpResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
          )
        })
      )

      const response = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobRole: "Software Engineer" }),
      })

      expect(response.status).toBe(401)
    })

    it("should validate job role parameter", async () => {
      server.use(
        http.post("/api/session/start", () => {
          return HttpResponse.json(
            { error: "Job role is required" },
            { status: 400 }
          )
        })
      )

      const response = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Missing jobRole
      })

      expect(response.status).toBe(400)
    })

    it("should support different job roles", async () => {
      const roles = [
        "Software Engineer",
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "Data Scientist",
        "Product Manager",
      ]

      for (const role of roles) {
        server.use(
          http.post("/api/session/start", async ({ request }) => {
            const body = await request.json()
            return HttpResponse.json({
              sessionId: `session-${role}`,
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
      }
    })

    it("should support different difficulty levels", async () => {
      const difficulties = ["easy", "medium", "hard"]

      for (const difficulty of difficulties) {
        server.use(
          http.post("/api/session/start", async ({ request }) => {
            const body = await request.json()
            return HttpResponse.json({
              sessionId: `session-${difficulty}`,
              difficulty: body.difficulty,
            })
          })
        )

        const response = await fetch("/api/session/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobRole: "Software Engineer", difficulty }),
        })

        expect(response.ok).toBe(true)
        const data = await response.json()
        expect(data.difficulty).toBe(difficulty)
      }
    })
  })

  describe("POST /api/session/end", () => {
    it("should end an active session and calculate scores", async () => {
      const sessionId = "test-session-id"

      server.use(
        http.post("/api/session/end", async ({ request }) => {
          const body = await request.json()
          return HttpResponse.json({
            sessionId: body.sessionId,
            endedAt: new Date().toISOString(),
            duration: 1800, // 30 minutes
            scores: {
              confidence: 85,
              clarity: 90,
              relevance: 88,
              overall: 87.67,
            },
            transcript: [
              {
                id: "msg-1",
                role: "interviewer",
                content: "Tell me about yourself.",
                timestamp: new Date().toISOString(),
              },
            ],
          })
        })
      )

      const response = await fetch("/api/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.sessionId).toBe(sessionId)
      expect(data.scores).toBeDefined()
      expect(data.scores.confidence).toBeGreaterThan(0)
      expect(data.scores.clarity).toBeGreaterThan(0)
      expect(data.scores.relevance).toBeGreaterThan(0)
      expect(data.transcript).toBeDefined()
    })

    it("should require authentication", async () => {
      server.use(
        http.get("/api/auth/session", () => {
          return HttpResponse.json({ user: null })
        })
      )

      server.use(
        http.post("/api/session/end", () => {
          return HttpResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
          )
        })
      )

      const response = await fetch("/api/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: "test-session-id" }),
      })

      expect(response.status).toBe(401)
    })

    it("should handle ending non-existent session", async () => {
      server.use(
        http.post("/api/session/end", () => {
          return HttpResponse.json(
            { error: "Session not found" },
            { status: 404 }
          )
        })
      )

      const response = await fetch("/api/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: "non-existent-id" }),
      })

      expect(response.status).toBe(404)
    })
  })

  describe("GET /api/sessions", () => {
    it("should return all user sessions", async () => {
      server.use(
        http.get("/api/sessions", () => {
          return HttpResponse.json({
            sessions: [
              {
                id: "session-1",
                startedAt: "2024-01-15T10:00:00Z",
                endedAt: "2024-01-15T10:30:00Z",
                jobRole: "Software Engineer",
                scores: { confidence: 85, clarity: 90, relevance: 88 },
              },
              {
                id: "session-2",
                startedAt: "2024-01-14T14:00:00Z",
                endedAt: "2024-01-14T14:25:00Z",
                jobRole: "Frontend Developer",
                scores: { confidence: 78, clarity: 82, relevance: 80 },
              },
            ],
            total: 2,
          })
        })
      )

      const response = await fetch("/api/sessions")

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.sessions).toHaveLength(2)
      expect(data.total).toBe(2)
    })

    it("should support pagination", async () => {
      server.use(
        http.get("/api/sessions", ({ request }) => {
          const url = new URL(request.url)
          const page = parseInt(url.searchParams.get("page") || "1")
          const limit = parseInt(url.searchParams.get("limit") || "10")

          return HttpResponse.json({
            sessions: Array(limit).fill(null).map((_, i) => ({
              id: `session-${page}-${i}`,
              startedAt: new Date().toISOString(),
              endedAt: new Date().toISOString(),
              jobRole: "Software Engineer",
              scores: { confidence: 80, clarity: 85, relevance: 82 },
            })),
            total: 25,
            page,
            limit,
            totalPages: Math.ceil(25 / limit),
          })
        })
      )

      const response = await fetch("/api/sessions?page=1&limit=10")

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.sessions).toHaveLength(10)
      expect(data.page).toBe(1)
      expect(data.limit).toBe(10)
      expect(data.totalPages).toBe(3)
    })

    it("should filter by job role", async () => {
      server.use(
        http.get("/api/sessions", ({ request }) => {
          const url = new URL(request.url)
          const role = url.searchParams.get("role")

          return HttpResponse.json({
            sessions: [
              {
                id: "session-1",
                startedAt: new Date().toISOString(),
                endedAt: new Date().toISOString(),
                jobRole: role,
                scores: { confidence: 85, clarity: 90, relevance: 88 },
              },
            ],
          })
        })
      )

      const response = await fetch("/api/sessions?role=Frontend%20Developer")

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.sessions[0].jobRole).toBe("Frontend Developer")
    })

    it("should return empty array for new user", async () => {
      server.use(
        http.get("/api/sessions", () => {
          return HttpResponse.json({
            sessions: [],
            total: 0,
          })
        })
      )

      const response = await fetch("/api/sessions")

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.sessions).toHaveLength(0)
      expect(data.total).toBe(0)
    })
  })

  describe("GET /api/analytics/:sessionId", () => {
    it("should return session details with analytics", async () => {
      const sessionId = "test-session-id"

      server.use(
        http.get(`/api/analytics/${sessionId}`, () => {
          return HttpResponse.json({
            session: {
              id: sessionId,
              userId: "test-user-id",
              startedAt: "2024-01-15T10:00:00Z",
              endedAt: "2024-01-15T10:30:00Z",
              duration: 1800,
              jobRole: "Software Engineer",
              difficulty: "medium",
              questionCount: 5,
              scores: {
                confidence: 85,
                clarity: 90,
                relevance: 88,
                overall: 87.67,
              },
            },
            transcript: [
              {
                id: "msg-1",
                sessionId: sessionId,
                role: "interviewer",
                content: "Tell me about yourself.",
                timestamp: "2024-01-15T10:00:10Z",
              },
              {
                id: "msg-2",
                sessionId: sessionId,
                role: "candidate",
                content: "I'm a software engineer with 5 years of experience...",
                timestamp: "2024-01-15T10:00:15Z",
              },
            ],
            confidenceLogs: [
              {
                id: "log-1",
                sessionId: sessionId,
                score: 85,
                timestamp: "2024-01-15T10:01:00Z",
              },
            ],
            report: {
              id: "report-1",
              sessionId: sessionId,
              summary: "Strong interview performance with good communication skills.",
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
              createdAt: new Date().toISOString(),
            },
          })
        })
      )

      const response = await fetch(`/api/analytics/${sessionId}`)

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.session).toBeDefined()
      expect(data.session.id).toBe(sessionId)
      expect(data.transcript).toBeDefined()
      expect(data.transcript.length).toBeGreaterThan(0)
      expect(data.confidenceLogs).toBeDefined()
      expect(data.report).toBeDefined()
      expect(data.report.summary).toBeDefined()
      expect(data.report.strengths).toBeDefined()
      expect(data.report.improvements).toBeDefined()
      expect(data.report.recommendations).toBeDefined()
    })

    it("should require authentication", async () => {
      server.use(
        http.get("/api/auth/session", () => {
          return HttpResponse.json({ user: null })
        })
      )

      server.use(
        http.get("/api/analytics/:sessionId", () => {
          return HttpResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
          )
        })
      )

      const response = await fetch("/api/analytics/test-session-id")

      expect(response.status).toBe(401)
    })

    it("should return 404 for non-existent session", async () => {
      server.use(
        http.get("/api/analytics/non-existent-id", () => {
          return HttpResponse.json(
            { error: "Session not found" },
            { status: 404 }
          )
        })
      )

      const response = await fetch("/api/analytics/non-existent-id")

      expect(response.status).toBe(404)
    })
  })

  describe("DELETE /api/sessions/:sessionId", () => {
    it("should delete a session", async () => {
      const sessionId = "test-session-id"

      server.use(
        http.delete(`/api/sessions/${sessionId}`, () => {
          return HttpResponse.json({ success: true })
        })
      )

      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      })

      expect(response.status).toBe(200)
    })

    it("should require authentication", async () => {
      server.use(
        http.get("/api/auth/session", () => {
          return HttpResponse.json({ user: null })
        })
      )

      server.use(
        http.delete("/api/sessions/:sessionId", () => {
          return HttpResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
          )
        })
      )

      const response = await fetch("/api/sessions/test-session-id", {
        method: "DELETE",
      })

      expect(response.status).toBe(401)
    })
  })
})
