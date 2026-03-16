"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff } from "lucide-react"

interface InterviewControlsProps {
  isMicOn: boolean
  isCameraOn: boolean
  isActive: boolean
  onToggleMic: () => void
  onToggleCamera: () => void
  onStart: () => void
  onEnd: () => void
  className?: string
}

export function InterviewControls({
  isMicOn,
  isCameraOn,
  isActive,
  onToggleMic,
  onToggleCamera,
  onStart,
  onEnd,
  className,
}: InterviewControlsProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-center gap-4">
          {/* Mic Toggle */}
          <Button
            variant={isMicOn ? "default" : "destructive"}
            size="icon"
            onClick={onToggleMic}
            disabled={isActive}
          >
            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          {/* Camera Toggle */}
          <Button
            variant={isCameraOn ? "default" : "destructive"}
            size="icon"
            onClick={onToggleCamera}
            disabled={isActive}
          >
            {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          {/* Start/End Interview */}
          {!isActive ? (
            <Button
              size="icon"
              className="h-14 w-14 rounded-full"
              onClick={onStart}
              disabled={!isMicOn || !isCameraOn}
            >
              <Phone className="h-6 w-6" />
            </Button>
          ) : (
            <Button
              size="icon"
              variant="destructive"
              className="h-14 w-14 rounded-full"
              onClick={onEnd}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          )}

          {/* Duration Display */}
          <div className="w-20 text-center">
            <div className="text-2xl font-mono font-bold" id="interview-timer">
              00:00
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
