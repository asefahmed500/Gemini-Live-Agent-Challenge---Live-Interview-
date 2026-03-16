"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { createSimulatedFaceAnalysis } from "@/lib/face-analyzer-fallback"
import type { FaceAnalysisResult, SpeechAnalysisResult } from "@/hooks/use-face-analysis"
import { Eye, Mic, Activity, Smile } from "lucide-react"

interface RealTimeAnalysisProps {
  isActive: boolean
  onAnalysisUpdate?: (data: {
    face: FaceAnalysisResult | null
    speech: SpeechAnalysisResult | null
    overall: number
  }) => void
}

export function RealTimeAnalysis({ isActive, onAnalysisUpdate }: RealTimeAnalysisProps) {
  const [faceData, setFaceData] = useState<FaceAnalysisResult | null>(null)
  const [speechData, setSpeechData] = useState<SpeechAnalysisResult | null>(null)
  const [overallScore, setOverallScore] = useState(75)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (!isActive) {
      setIsAnalyzing(false)
      return
    }

    setIsAnalyzing(true)
    const interval = setInterval(() => {
      // Simulate face analysis
      const faceAnalysis = createSimulatedFaceAnalysis("answering", Date.now() % 10000)

      // Simulate speech analysis
      const speechAnalysis: SpeechAnalysisResult = {
        wordsPerMinute: 120 + Math.random() * 40,
        fillerWordCount: Math.floor(Math.random() * 5),
        fillerWords: ["um", "uh", "like"].filter(() => Math.random() > 0.7),
        clarityScore: 70 + Math.random() * 25,
        sentiment: Math.random() > 0.5 ? "positive" : "neutral",
        confidence: 70 + Math.random() * 25,
        timestamp: new Date(),
      }

      // Calculate overall score
      const faceScore = faceAnalysis.eyeContact
      const speechScore = speechAnalysis.clarityScore
      const overall = Math.round((faceScore * 0.4 + speechScore * 0.6))

      setFaceData(faceAnalysis)
      setSpeechData(speechAnalysis)
      setOverallScore(overall)

      // Notify parent component
      onAnalysisUpdate?.({
        face: faceAnalysis,
        speech: speechAnalysis,
        overall,
      })
    }, 2000) // Update every 2 seconds

    return () => {
      clearInterval(interval)
      setIsAnalyzing(false)
    }
  }, [isActive, onAnalysisUpdate])

  if (!isActive) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span>Real-Time Analysis</span>
          <Badge
            variant={isAnalyzing ? "default" : "outline"}
            className="text-xs"
          >
            {isAnalyzing ? "Active" : "Standby"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Overall Score</span>
            <span className="font-semibold">{Math.round(overallScore)}%</span>
          </div>
          <Progress
            value={overallScore}
            className="h-2"
          />
        </div>

        {/* Face Analysis */}
        {faceData && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium">
              <Eye className="h-3 w-3 text-primary" />
              <span>Face Analysis</span>
            </div>

            <div className="space-y-1.5">
              <MetricRow
                label="Eye Contact"
                value={faceData.eyeContact}
                color="blue"
              />
              <MetricRow
                label="Expression"
                value={faceData.expressions.happy * 100}
                color="green"
              />
              <MetricRow
                label="Engagement"
                value={(faceData.expressions.neutral + faceData.expressions.happy) * 50}
                color="purple"
              />
            </div>

            <div className="flex flex-wrap gap-1 pt-1">
              <Badge variant="outline" className="text-xs">
                {faceData.dominantExpression}
              </Badge>
            </div>
          </div>
        )}

        {/* Speech Analysis */}
        {speechData && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium">
              <Mic className="h-3 w-3 text-primary" />
              <span>Speech Analysis</span>
            </div>

            <div className="space-y-1.5">
              <MetricRow
                label="Clarity"
                value={speechData.clarityScore}
                color="green"
              />
              <MetricRow
                label="WPM"
                value={Math.min(100, (speechData.wordsPerMinute / 160) * 100)}
                displayValue={`${Math.round(speechData.wordsPerMinute)}`}
                color="blue"
              />
              <MetricRow
                label="Confidence"
                value={speechData.confidence}
                color="purple"
              />
            </div>

            {speechData.fillerWordCount > 0 && (
              <div className="pt-1 text-xs text-muted-foreground">
                {speechData.fillerWordCount} filler word{speechData.fillerWordCount !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        )}

        {/* Status Indicator */}
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
          <Activity className="h-3 w-3 text-primary animate-pulse" />
          <span className="text-xs text-muted-foreground">
            {isAnalyzing ? "Analysis in progress..." : "Waiting to start"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

interface MetricRowProps {
  label: string
  value: number
  color?: "blue" | "green" | "purple" | "orange"
  displayValue?: string
}

function MetricRow({ label, value, color = "blue", displayValue }: MetricRowProps) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 flex-shrink-0 text-muted-foreground">{label}</span>
      <div className="flex-1">
        <Progress value={value} className="h-1.5" />
      </div>
      <span className="w-10 flex-shrink-0 text-right font-medium tabular-nums">
        {displayValue ?? `${Math.round(value)}%`}
      </span>
    </div>
  )
}
