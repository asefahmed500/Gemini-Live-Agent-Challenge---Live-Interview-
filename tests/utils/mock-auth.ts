import { renderHook, act } from "@testing-library/react"
import { vi } from "vitest"
import { signIn, signOut, useSession } from "@/lib/auth-client"

export type MockSession = {
  user: {
    id: string
    email: string
    name: string
  }
  session: {
    token: string
    expiresAt: string
  }
}

export const mockAuthenticatedSession: MockSession = {
  user: {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
  },
  session: {
    token: "test-session-token",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
}

export const mockUnauthenticatedSession = null

/**
 * Helper to mock an authenticated session
 */
export function mockAuthenticated() {
  vi.mocked(useSession).mockReturnValue({
    data: mockAuthenticatedSession,
    isPending: false,
    error: null,
  })
}

/**
 * Helper to mock an unauthenticated session
 */
export function mockUnauthenticated() {
  vi.mocked(useSession).mockReturnValue({
    data: null,
    isPending: false,
    error: null,
  })
}

/**
 * Helper to mock loading session state
 */
export function mockSessionLoading() {
  vi.mocked(useSession).mockReturnValue({
    data: null,
    isPending: true,
    error: null,
  })
}

/**
 * Helper to simulate sign in
 */
export async function mockSignIn(credentials: { email: string; password: string }) {
  await signIn.email(credentials)
}

/**
 * Helper to simulate sign out
 */
export async function mockSignOut() {
  await signOut()
}
