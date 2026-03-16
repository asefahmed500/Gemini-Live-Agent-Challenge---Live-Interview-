"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ConfidenceMetrics } from "@/hooks/use-confidence-score"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface ConfidenceMeterProps {
  metrics: ConfidenceMetrics
  trend?: string
  className?: string
}

export function ConfidenceMeter({
  metrics,
  trend = "stable",
  className,
}: ConfidenceMeterProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    return "Needs Work"
  }

  const getTrendIcon = () => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) return "success"
    if (score >= 60) return "warning"
    return "danger"
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <span>Confidence Score</span>
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span
              className={`text-lg font-bold ${getScoreColor(metrics.overall)}`}
            >
              {Math.round(metrics.overall)}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-muted-foreground">Overall</span>
            <span className="text-xs font-medium">
              {getScoreLabel(metrics.overall)}
            </span>
          </div>
          <Progress
            value={metrics.overall}
            color={getProgressColor(metrics.overall)}
          />
        </div>

        {metrics.eyeContact !== undefined && (
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-muted-foreground">Eye Contact</span>
              <span className="text-xs">{Math.round(metrics.eyeContact)}%</span>
            </div>
            <Progress value={metrics.eyeContact} />
          </div>
        )}

        {metrics.posture !== undefined && (
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-muted-foreground">Posture</span>
              <span className="text-xs">{Math.round(metrics.posture)}%</span>
            </div>
            <Progress value={metrics.posture} />
          </div>
        )}

        {metrics.voiceTone !== undefined && (
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-muted-foreground">Voice Tone</span>
              <span className="text-xs">{Math.round(metrics.voiceTone)}%</span>
            </div>
            <Progress value={metrics.voiceTone} />
          </div>
        )}

        {metrics.speechClarity !== undefined && (
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-muted-foreground">Speech Clarity</span>
              <span className="text-xs">
                {Math.round(metrics.speechClarity)}%
              </span>
            </div>
            <Progress value={metrics.speechClarity} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
