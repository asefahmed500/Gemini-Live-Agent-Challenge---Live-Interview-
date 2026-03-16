"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useFaceAnalysis } from "@/hooks/use-face-analysis"
import { Eye, AlertCircle, Smile, Frown, Meh } from "lucide-react"

interface RealTimeAnalysisPanelProps {
  stream: MediaStream | null
  isActive: boolean
}

export function RealTimeAnalysisPanel({
  stream,
  isActive,
}: RealTimeAnalysisPanelProps) {
  const {
    isAnalyzing,
    currentExpression,
    eyeContactScore,
    faceDetected,
    dominantExpression,
    startAnalysis,
  } = useFaceAnalysis()

  const getExpressionIcon = () => {
    switch (dominantExpression) {
      case "happy":
        return <Smile className="h-5 w-5 text-green-500" />
      case "sad":
        return <Frown className="h-5 w-5 text-blue-500" />
      default:
        return <Meh className="h-5 w-5 text-yellow-500" />
    }
  }

  const getExpressionColor = () => {
    switch (dominantExpression) {
      case "happy":
        return "bg-green-500"
      case "sad":
        return "bg-blue-500"
      case "angry":
        return "bg-red-500"
      case "fearful":
        return "bg-purple-500"
      case "disgusted":
        return "bg-orange-500"
      case "surprised":
        return "bg-pink-500"
      default:
        return "bg-yellow-500"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span>Real-Time Analysis</span>
          <Badge
            variant={faceDetected ? "default" : "destructive"}
            className={faceDetected ? "bg-green-500" : ""}
          >
            {faceDetected ? "Face Detected" : "No Face"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isAnalyzing && isActive && stream && (
          <button
            onClick={() => {
              const video = document.querySelector("video")
              if (video) {
                startAnalysis(video)
              }
            }}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Start Face Analysis
          </button>
        )}

        {isAnalyzing && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Eye Contact
                </span>
                <span>{eyeContactScore}%</span>
              </div>
              <Progress value={eyeContactScore} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium">Facial Expression</div>
              <div className="flex items-center gap-2">
                {getExpressionIcon()}
                <div className="flex-1 space-y-1">
                  {Object.entries(currentExpression)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([expression, value]) => (
                      <div key={expression} className="flex items-center gap-2">
                        <span className="w-16 text-xs capitalize">
                          {expression}
                        </span>
                        <Progress
                          value={value * 100}
                          className={`h-1.5 flex-1 ${getExpressionColor()} ${expression === dominantExpression ? "opacity-100" : "opacity-50"}`}
                        />
                        <span className="w-8 text-xs">
                          {Math.round(value * 100)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {!isActive && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-3 w-3" />
            Start an interview to enable real-time analysis
          </div>
        )}
      </CardContent>
    </Card>
  )
}
