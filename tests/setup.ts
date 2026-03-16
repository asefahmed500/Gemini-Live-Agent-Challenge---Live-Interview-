import { beforeAll, afterEach, afterAll, vi } from "vitest"
import { cleanup } from "@testing-library/react"
import "@testing-library/jest-dom"
import { setupServer } from "msw/node"
import { HttpResponse, http } from "msw"

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia for theming
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: "",
  thresholds: [],
})) as any

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as any

// Mock MediaStream and mediaDevices for interview tests
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
  getSettings: () => ({}),
  getConstraints: () => ({}),
})

Object.defineProperty(navigator, "mediaDevices", {
  writable: true,
  value: {
    getUserMedia: vi.fn().mockResolvedValue(createMockStream()),
    enumerateDevices: vi.fn().mockResolvedValue([]),
    getSupportedConstraints: vi.fn().mockReturnValue({
      audio: true,
      video: true,
    }),
    getDisplayMedia: vi.fn().mockResolvedValue(createMockStream()),
  },
})

// Mock WebSocket
class MockWebSocket {
  url: string
  readyState: number = 0 // CONNECTING
  onopen: ((event: MessageEvent) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null

  constructor(url: string) {
    this.url = url
    setTimeout(() => {
      this.readyState = 1 // OPEN
      this.onopen?.(new MessageEvent("open"))
    }, 0)
  }

  send(data: string) {
    // Mock send
  }

  close() {
    this.readyState = 3 // CLOSED
    this.onclose?.(new CloseEvent("close"))
  }

  addEventListener(type: string, listener: EventListener) {
    // Mock addEventListener
  }

  removeEventListener(type: string, listener: EventListener) {
    // Mock removeEventListener
  }
}

global.WebSocket = MockWebSocket as any

// MSW Server Setup - No auth required
const handlers = [
  // Auth endpoints now return simple responses (auth is disabled)
  http.post("/api/auth/sign-up/email", async () => {
    return HttpResponse.json({ message: "Auth is disabled" })
  }),

  http.post("/api/auth/sign-in/email", async () => {
    return HttpResponse.json({ message: "Auth is disabled" })
  }),

  http.get("/api/auth/session", async () => {
    return HttpResponse.json({ message: "Auth is disabled" })
  }),

  http.post("/api/auth/sign-out", async () => {
    return HttpResponse.json({ message: "Auth is disabled" })
  }),

  // Session endpoints (no auth check)
  http.post("/api/session/start", async ({ request }) => {
    const body = await request.json() as { jobRole: string; difficulty: string; userId?: string }
    return HttpResponse.json({
      sessionId: `test-session-${Date.now()}`,
      status: "active",
      websocketUrl: "ws://localhost:3001",
      token: "test-token",
      jobRole: body.jobRole || "Frontend Developer",
      difficulty: body.difficulty || "medium",
    })
  }),

  http.post("/api/session/end", async ({ request }) => {
    const body = await request.json() as { sessionId: string }
    return HttpResponse.json({
      sessionId: body.sessionId,
      status: "completed",
      reportId: `test-report-${Date.now()}`,
      scores: {
        confidence: 85,
        clarity: 90,
        relevance: 88,
        overall: 87.67,
      },
    })
  }),

  http.get("/api/sessions", async ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId") || "guest-user-id"

    return HttpResponse.json({
      sessions: [
        {
          id: `session-${Date.now()}`,
          userId: userId,
          jobRole: "Frontend Developer",
          difficulty: "medium",
          status: "completed",
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          endedAt: new Date().toISOString(),
          overallScore: 85,
          confidenceScore: 85,
          communicationScore: 90,
          technicalScore: 88,
        },
      ],
    })
  }),

  http.get("/api/analytics/:sessionId", async ({ params }) => {
    return HttpResponse.json({
      sessionId: params.sessionId,
      jobRole: "Frontend Developer",
      difficulty: "medium",
      status: "completed",
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      endedAt: new Date().toISOString(),
      scores: {
        overall: 85,
        confidence: 85,
        communication: 90,
        technical: 88,
      },
      transcripts: [
        {
          role: "assistant",
          content: "Tell me about yourself.",
          timestamp: new Date().toISOString(),
        },
        {
          role: "user",
          content: "I'm a developer with experience in React and TypeScript.",
          timestamp: new Date().toISOString(),
        },
      ],
      confidenceLog: [
        {
          timestamp: new Date().toISOString(),
          overallConfidence: 85,
          eyeContact: 80,
          posture: 85,
          voiceTone: 90,
        },
      ],
      report: {
        id: `report-${Date.now()}`,
        sessionId: params.sessionId,
        summary: "Great interview performance!",
        strengths: ["Clear communication", "Good confidence", "Strong technical answers"],
        improvements: ["Consider providing more specific examples"],
        suggestions: ["Practice behavioral questions"],
        detailedFeedback: "You demonstrated strong communication skills and technical knowledge throughout the interview.",
      },
    })
  }),
]

export const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: "error" }))

afterAll(() => server.close())

// Reset handlers after each test
afterEach(() => server.resetHandlers())
