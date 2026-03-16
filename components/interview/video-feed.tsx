"use client"

import { useEffect, useRef } from "react"

interface VideoFeedProps {
  stream: MediaStream | null
  isAnalyzing?: boolean
  className?: string
}

export function VideoFeed({
  stream,
  isAnalyzing = false,
  className,
}: VideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  if (!stream) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-muted ${className}`}
      >
        <div className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted-foreground/10">
            <svg
              className="h-12 w-12 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-muted-foreground">Camera off</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-black ${className}`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
      />

      {isAnalyzing && (
        <div className="pointer-events-none absolute inset-0">
          {/* Analysis overlay */}
          <div className="absolute inset-4 rounded-lg border-2 border-primary/30" />
          <div className="absolute top-6 right-6">
            <div className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-sm">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-xs font-medium text-white">Analyzing</span>
            </div>
          </div>

          {/* Face tracking indicators */}
          <div className="absolute top-1/4 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full border border-primary/40" />
          <div className="absolute top-1/2 left-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/60" />
        </div>
      )}

      {/* Microphone indicator */}
      <div className="absolute bottom-4 left-4">
        <div className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-sm">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs font-medium text-white">Mic Active</span>
        </div>
      </div>
    </div>
  )
}
