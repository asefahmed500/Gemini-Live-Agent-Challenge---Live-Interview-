import { render, RenderOptions } from "@testing-library/react"
import { ReactElement, ReactNode } from "react"

/**
 * Create a mock FormData object
 */
export function createMockFormData(data: Record<string, string>) {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return formData
}

/**
 * Generate a test user object
 */
export function createTestUser(overrides?: Partial<{
  id: string
  email: string
  name: string
}>) {
  return {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    ...overrides,
  }
}

/**
 * Generate a test session object
 */
export function createTestSession(overrides?: Partial<{
  id: string
  userId: string
  startedAt: string
  endedAt: string
}>) {
  return {
    id: "test-session-id",
    userId: "test-user-id",
    startedAt: new Date().toISOString(),
    endedAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    ...overrides,
  }
}

/**
 * Generate test scores
 */
export function createTestScores(overrides?: Partial<{
  confidence: number
  clarity: number
  relevance: number
}>) {
  return {
    confidence: 85,
    clarity: 90,
    relevance: 88,
    ...overrides,
  }
}

/**
 * Mock Router push
 */
export const mockRouterPush = vi.fn()
export const mockRouterReplace = vi.fn()
export const mockRouterRefresh = vi.fn()

export function mockNextRouter() {
  vi.mock("next/navigation", () => ({
    useRouter: () => ({
      push: mockRouterPush,
      replace: mockRouterReplace,
      refresh: mockRouterRefresh,
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
  }))
}

/**
 * Clean up router mocks
 */
export function cleanupRouterMocks() {
  mockRouterPush.mockReset()
  mockRouterReplace.mockReset()
  mockRouterRefresh.mockReset()
}

/**
 * Wait for a specified amount of time
 */
export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

// Re-export testing library utilities
export * from "@testing-library/react"
