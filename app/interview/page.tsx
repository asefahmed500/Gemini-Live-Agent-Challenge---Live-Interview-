"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { VideoFeed } from "@/components/interview/video-feed"
import { AudioWaveform } from "@/components/interview/audio-waveform"
import { ConfidenceMeter } from "@/components/interview/confidence-meter"
import {
  TranscriptPanel,
  TranscriptEntry,
} from "@/components/interview/transcript-panel"
import { InterviewControls } from "@/components/interview/interview-controls"
import { useMediaStream } from "@/hooks/use-media-stream"
import { useConfidenceScore } from "@/hooks/use-confidence-score"
import { useSpeechToText } from "@/hooks/use-speech-to-text"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { SetupForm } from "@/components/interview/setup-form"
import { Loader2, Send, Mic, MicOff, Volume2, VolumeX } from "lucide-react"

export default function InterviewPage() {
  const router = useRouter()

  const [jobRole, setJobRole] = useState("Frontend Developer")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  )
  const [cvContent, setCvContent] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [interviewType, setInterviewType] = useState<
    "chat" | "video" | "voice"
  >("chat")
  const [isActive, setIsActive] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([])
  const [userInput, setUserInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(true)

  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    stream,
    error: mediaError,
    isLoading: mediaLoading,
    start: startMedia,
    stop: stopMedia,
  } = useMediaStream({
    video: { width: 1280, height: 720, facingMode: "user" },
    audio: true,
  })

  const { currentScore, updateScore, resetScore, trend } = useConfidenceScore()

  // Speech-to-Text
  const messageHandlerRef = useRef<((msg: string) => void) | null>(null)

  const {
    isListening: isSTTListening,
    isSupported: isSTTSupported,
    startListening: startSTT,
    stopListening: stopSTT,
  } = useSpeechToText({
    continuous: true,
    interimResults: true,
    onResult: (transcript, isFinal) => {
      if (isFinal && transcript.trim()) {
        setUserInput(transcript.trim())
        if (isVoiceMode && messageHandlerRef.current) {
          messageHandlerRef.current(transcript.trim())
        }
      }
    },
    onError: (error) => {
      console.error("STT Error:", error)
    },
  })

  // Text-to-Speech
  const {
    isSpeaking: isTTSSpeaking,
    isSupported: isTTSSupported,
    speak: speakText,
    stop: stopTTS,
  } = useTextToSpeech({
    voice: "Google US English",
    rate: 1,
    pitch: 1,
  })

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive])

  const handleStartMedia = async () => {
    try {
      await startMedia()
    } catch (err) {
      console.error("Failed to start media:", err)
    }
  }

  const handleToggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled
      })
    }
  }

  const handleToggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled
      })
    }
  }

  const handleStartInterview = async () => {
    try {
      setIsProcessing(true)

      const response = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole,
          difficulty,
          cvContent,
          jobDescription,
          interviewType,
        }),
      })

      if (!response.ok) throw new Error("Failed to start session")

      const data = await response.json()
      setSessionId(data.sessionId)
      setIsActive(true)
      resetScore()
      setTranscripts([])

      const chatResponse = await fetch("/api/session/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: data.sessionId,
          userMessage: "I'm ready to start the interview",
          isFirstMessage: true,
          jobRole,
          difficulty,
          cvContent,
          jobDescription,
        }),
      })

      if (chatResponse.ok) {
        const chatData = await chatResponse.json()
        const aiEntry: TranscriptEntry = {
          role: "assistant",
          content: chatData.nextQuestion,
          timestamp: new Date(),
          confidence: 90,
        }
        setTranscripts([aiEntry])

        // Speak the first question if autoSpeak is enabled
        if (autoSpeak && isTTSSupported) {
          speakText(chatData.nextQuestion)
        }

        updateScore({
          eyeContact: 75,
          posture: 80,
          facialExpression: 75,
          voiceTone: 70,
          speechClarity: 75,
          overall: 75,
        })
      }
    } catch (err) {
      console.error("Failed to start interview:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSendMessage = async (overrideMessage?: string) => {
    const userMessage = overrideMessage || userInput.trim()
    if (!userMessage || !sessionId || isProcessing) return

    if (!overrideMessage) {
      setUserInput("")
    }
    setIsProcessing(true)

    const userEntry: TranscriptEntry = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
      confidence: 80,
    }
    setTranscripts((prev) => [...prev, userEntry])

    // Stop TTS when user is speaking
    stopTTS()

    try {
      const response = await fetch("/api/session/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userMessage, isFirstMessage: false }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()

      const aiEntry: TranscriptEntry = {
        role: "assistant",
        content: data.feedback
          ? `Feedback: ${data.feedback}\n\nNext: ${data.nextQuestion}`
          : data.nextQuestion,
        timestamp: new Date(),
        confidence: 85,
      }
      setTranscripts((prev) => [...prev, aiEntry])

      // Speak the AI response if autoSpeak is enabled
      if (autoSpeak && isTTSSupported) {
        speakText(data.nextQuestion)
      }

      updateScore({
        eyeContact: 70 + Math.random() * 20,
        posture: 75 + Math.random() * 20,
        facialExpression: 70 + Math.random() * 20,
        voiceTone: 65 + Math.random() * 25,
        speechClarity: 70 + Math.random() * 20,
        overall: 70 + Math.random() * 20,
      })
    } catch (err) {
      console.error("Failed to send message:", err)
    } finally {
      setIsProcessing(false)
      if (!overrideMessage) {
        inputRef.current?.focus()
      }
    }
  }

  // Set up message handler ref for STT
  useEffect(() => {
    messageHandlerRef.current = handleSendMessage
  }, [handleSendMessage])

  const handleEndInterview = async () => {
    try {
      setIsActive(false)
      if (sessionId) {
        await fetch("/api/session/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        })
      }
      stopMedia()
      router.push(`/dashboard/${sessionId}`)
    } catch (err) {
      console.error("Failed to end interview:", err)
      stopMedia()
      router.push("/dashboard")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (!stream && interviewType !== "chat") {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto w-full max-w-3xl">
          <SetupForm
            jobRole={jobRole}
            setJobRole={setJobRole}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            cvContent={cvContent}
            setCvContent={setCvContent}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            interviewType={interviewType}
            setInterviewType={setInterviewType}
            onStart={handleStartMedia}
            isProcessing={mediaLoading}
          />

          {mediaError && (
            <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {mediaError.message}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!isActive) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto w-full max-w-3xl">
          <SetupForm
            jobRole={jobRole}
            setJobRole={setJobRole}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            cvContent={cvContent}
            setCvContent={setCvContent}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            interviewType={interviewType}
            setInterviewType={setInterviewType}
            onStart={handleStartInterview}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Interview</h1>
              <p className="text-sm text-muted-foreground">
                {jobRole} ·{" "}
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </p>
            </div>
            <Badge variant={isActive ? "default" : "outline"}>
              {isActive ? "Live" : "Ready"}
            </Badge>
          </div>

          <VideoFeed
            stream={stream}
            isAnalyzing={isActive}
            className="aspect-video rounded-lg"
          />

          <AudioWaveform stream={stream} className="h-12" />

          {(isVoiceMode || isTTSSpeaking) && (
            <div className="flex items-center justify-center gap-2 text-sm">
              {isSTTListening && (
                <Badge variant="default" className="animate-pulse bg-red-500">
                  <Mic className="mr-1 h-3 w-3" />
                  Listening...
                </Badge>
              )}
              {isTTSSpeaking && (
                <Badge variant="default" className="animate-pulse bg-green-500">
                  <Volume2 className="mr-1 h-3 w-3" />
                  AI Speaking...
                </Badge>
              )}
            </div>
          )}

          <InterviewControls
            isMicOn={stream?.getAudioTracks().some((t) => t.enabled) ?? false}
            isCameraOn={
              stream?.getVideoTracks().some((t) => t.enabled) ?? false
            }
            isActive={isActive}
            onToggleMic={handleToggleMic}
            onToggleCamera={handleToggleCamera}
            onStart={handleStartInterview}
            onEnd={handleEndInterview}
          />

          {isActive && (
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      (e.preventDefault(), handleSendMessage())
                    }
                    placeholder={
                      isVoiceMode
                        ? "Speak your answer..."
                        : "Type your answer..."
                    }
                    disabled={isProcessing}
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!userInput.trim() || isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                  {isSTTSupported && (
                    <Button
                      variant={isVoiceMode ? "default" : "outline"}
                      size="icon"
                      onClick={() => {
                        if (isVoiceMode) {
                          stopSTT()
                          setIsVoiceMode(false)
                        } else {
                          startSTT()
                          setIsVoiceMode(true)
                        }
                      }}
                      title={
                        isVoiceMode ? "Stop voice input" : "Start voice input"
                      }
                    >
                      {isSTTListening ? (
                        <Mic className="h-4 w-4 animate-pulse" />
                      ) : (
                        <MicOff className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  {isTTSSupported && (
                    <Button
                      variant={autoSpeak ? "default" : "outline"}
                      size="icon"
                      onClick={() => setAutoSpeak(!autoSpeak)}
                      title={autoSpeak ? "Disable AI voice" : "Enable AI voice"}
                    >
                      {autoSpeak ? (
                        <Volume2 className="h-4 w-4" />
                      ) : (
                        <VolumeX className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <ConfidenceMeter metrics={currentScore} trend={trend} />
          <TranscriptPanel transcripts={transcripts} isLive={isActive} />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-mono">{formatTime(elapsedTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="text-xs">
                  {isActive ? "Active" : "Ready"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
