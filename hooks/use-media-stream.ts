"use client"

import { useEffect, useRef, useState } from "react"

export interface MediaStreamOptions {
  video?: boolean | MediaTrackConstraints
  audio?: boolean | MediaTrackConstraints
}

export function useMediaStream(options: MediaStreamOptions = {}) {
  const streamRef = useRef<MediaStream | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const start = async (customOptions?: MediaStreamOptions) => {
    const opts = { ...options, ...customOptions }

    try {
      setIsLoading(true)
      setError(null)

      const mediaStream = await navigator.mediaDevices.getUserMedia(opts)

      streamRef.current = mediaStream
      setStream(mediaStream)

      return mediaStream
    } catch (err) {
      const mediaError = err as Error
      setError(mediaError)
      throw mediaError
    } finally {
      setIsLoading(false)
    }
  }

  const stop = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
      streamRef.current = null
      setStream(null)
    }
  }

  useEffect(() => {
    return () => {
      stop()
    }
  }, [])

  return {
    stream,
    error,
    isLoading,
    start,
    stop,
  }
}
