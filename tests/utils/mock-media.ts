import { vi } from "vitest"

export type MockMediaTrack = {
  kind: string
  id: string
  label: string
  enabled: boolean
  muted: boolean
  stop: () => void
}

export type MockMediaStream = {
  id: string
  active: boolean
  getAudioTracks: () => MockMediaTrack[]
  getVideoTracks: () => MockMediaTrack[]
  getTracks: () => MockMediaTrack[]
  addEventListener: (event: string, listener: EventListener) => void
  removeEventListener: (event: string, listener: EventListener) => void
}

/**
 * Create a mock media stream with audio and video tracks
 */
export function createMockMediaStream(): MockMediaStream {
  return {
    id: "mock-stream-id",
    active: true,
    getAudioTracks: () => [
      {
        kind: "audio",
        id: "mock-audio-track",
        label: "Mock Microphone",
        enabled: true,
        muted: false,
        stop: vi.fn(),
      },
    ],
    getVideoTracks: () => [
      {
        kind: "video",
        id: "mock-video-track",
        label: "Mock Camera",
        enabled: true,
        muted: false,
        stop: vi.fn(),
      },
    ],
    getTracks: () => [],
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
}

/**
 * Mock getUserMedia to resolve with a mock stream
 */
export function mockGetUserMedia(stream?: MockMediaStream) {
  const mockStream = stream || createMockMediaStream()

  vi.spyOn(navigator.mediaDevices, "getUserMedia").mockResolvedValue(
    mockStream as unknown as MediaStream
  )

  return mockStream
}

/**
 * Mock getUserMedia to reject with an error
 */
export function mockGetUserMediaError(error: Error) {
  vi.spyOn(navigator.mediaDevices, "getUserMedia").mockRejectedValue(error)
}

/**
 * Reset media device mocks
 */
export function resetMediaMocks() {
  vi.restoreAllMocks()
}
