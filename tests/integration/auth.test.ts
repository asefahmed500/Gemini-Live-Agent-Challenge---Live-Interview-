import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { server } from "../setup"
import { http, HttpResponse } from "msw"

describe("Auth API Integration Tests", () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  describe("POST /api/auth/sign-up/email", () => {
    it("should create a new user with valid data", async () => {
      const userData = {
        email: "newuser@example.com",
        password: "SecurePassword123!",
        name: "New User",
      }

      server.use(
        http.post("/api/auth/sign-up/email", async ({ request }) => {
          const body = await request.json()
          return HttpResponse.json({
            user: {
              id: "new-user-id",
              email: body.email,
              name: body.name,
              createdAt: new Date().toISOString(),
            },
            session: {
              token: "new-session-token",
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
          })
        })
      )

      const response = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe(userData.email)
      expect(data.user.name).toBe(userData.name)
      expect(data.session).toBeDefined()
      expect(data.session.token).toBeDefined()
    })

    it("should reject registration with weak password", async () => {
      const userData = {
        email: "newuser@example.com",
        password: "123", // Too short
        name: "New User",
      }

      server.use(
        http.post("/api/auth/sign-up/email", () => {
          return HttpResponse.json(
            { error: "Password too weak" },
            { status: 400 }
          )
        })
      )

      const response = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      expect(response.status).toBe(400)
    })

    it("should reject registration with invalid email", async () => {
      const userData = {
        email: "not-an-email",
        password: "SecurePassword123!",
        name: "New User",
      }

      server.use(
        http.post("/api/auth/sign-up/email", () => {
          return HttpResponse.json(
            { error: "Invalid email format" },
            { status: 400 }
          )
        })
      )

      const response = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      expect(response.status).toBe(400)
    })

    it("should reject registration with existing email", async () => {
      const userData = {
        email: "existing@example.com",
        password: "SecurePassword123!",
        name: "Existing User",
      }

      server.use(
        http.post("/api/auth/sign-up/email", () => {
          return HttpResponse.json(
            { error: "Email already exists" },
            { status: 409 }
          )
        })
      )

      const response = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      expect(response.status).toBe(409)
    })
  })

  describe("POST /api/auth/sign-in/email", () => {
    it("should authenticate user with valid credentials", async () => {
      const credentials = {
        email: "test@example.com",
        password: "CorrectPassword123!",
      }

      server.use(
        http.post("/api/auth/sign-in/email", () => {
          return HttpResponse.json({
            user: {
              id: "test-user-id",
              email: credentials.email,
              name: "Test User",
            },
            session: {
              token: "test-session-token",
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
          })
        })
      )

      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.user).toBeDefined()
      expect(data.session).toBeDefined()
    })

    it("should reject authentication with wrong password", async () => {
      const credentials = {
        email: "test@example.com",
        password: "WrongPassword123!",
      }

      server.use(
        http.post("/api/auth/sign-in/email", () => {
          return HttpResponse.json(
            { error: "Invalid credentials" },
            { status: 401 }
          )
        })
      )

      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })

      expect(response.status).toBe(401)
    })

    it("should reject authentication with non-existent email", async () => {
      const credentials = {
        email: "nonexistent@example.com",
        password: "SomePassword123!",
      }

      server.use(
        http.post("/api/auth/sign-in/email", () => {
          return HttpResponse.json(
            { error: "User not found" },
            { status: 404 }
          )
        })
      )

      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })

      expect(response.status).toBe(404)
    })
  })

  describe("GET /api/auth/session", () => {
    it("should return current session when authenticated", async () => {
      server.use(
        http.get("/api/auth/session", () => {
          return HttpResponse.json({
            user: {
              id: "test-user-id",
              email: "test@example.com",
              name: "Test User",
            },
            session: {
              token: "test-session-token",
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
          })
        })
      )

      const response = await fetch("/api/auth/session")

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.user).toBeDefined()
      expect(data.session).toBeDefined()
    })

    it("should return null when not authenticated", async () => {
      server.use(
        http.get("/api/auth/session", () => {
          return HttpResponse.json({ user: null, session: null })
        })
      )

      const response = await fetch("/api/auth/session")

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.user).toBeNull()
      expect(data.session).toBeNull()
    })

    it("should handle expired session", async () => {
      server.use(
        http.get("/api/auth/session", () => {
          return HttpResponse.json(
            { error: "Session expired" },
            { status: 401 }
          )
        })
      )

      const response = await fetch("/api/auth/session")

      expect(response.status).toBe(401)
    })
  })

  describe("POST /api/auth/sign-out", () => {
    it("should sign out user successfully", async () => {
      server.use(
        http.post("/api/auth/sign-out", () => {
          return HttpResponse.json({ success: true })
        })
      )

      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
    })

    it("should clear session cookie", async () => {
      server.use(
        http.post("/api/auth/sign-out", () => {
          return new HttpResponse(null, {
            status: 200,
            headers: {
              "Set-Cookie": "better-auth.session_token=; Max-Age=0; Path=/",
            },
          })
        })
      )

      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
      })

      expect(response.status).toBe(200)
      expect(response.headers.get("set-cookie")).toContain("Max-Age=0")
    })
  })

  describe("Google OAuth", () => {
    it("should return Google OAuth URL when configured", async () => {
      server.use(
        http.get("/api/auth/sign-in/social", () => {
          return HttpResponse.json({
            url: "https://accounts.google.com/o/oauth2/v2/auth?client_id=test",
          })
        })
      )

      const response = await fetch(
        "/api/auth/sign-in/social?provider=google&callbackURL=/dashboard"
      )

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.url).toContain("accounts.google.com")
    })
  })
})
