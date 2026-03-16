"use client"

import { useState, useCallback, useMemo } from "react"

export interface ConfidenceMetrics {
  eyeContact?: number
  posture?: number
  facialExpression?: number
  voiceTone?: number
  speechClarity?: number
  overall: number
}

export function useConfidenceScore() {
  const [currentScore, setCurrentScore] = useState<ConfidenceMetrics>({
    overall: 0,
  })
  const [history, setHistory] = useState<ConfidenceMetrics[]>([])

  const updateScore = useCallback((metrics: ConfidenceMetrics) => {
    setCurrentScore(metrics)

    setHistory((prev) => {
      const newHistory = [...prev, metrics]
      // Keep only last 100 data points
      if (newHistory.length > 100) {
        return newHistory.slice(-100)
      }
      return newHistory
    })
  }, [])

  const resetScore = useCallback(() => {
    setCurrentScore({ overall: 0 })
    setHistory([])
  }, [])

  // Calculate average score
  const averageScore = useMemo(() => {
    if (history.length > 0) {
      const sum = history.reduce((acc, curr) => acc + curr.overall, 0)
      return sum / history.length
    }
    return 0
  }, [history])

  // Get trend (improving, declining, stable)
  const trend = useMemo(() => {
    if (history.length < 10) return "stable"

    const recent = history.slice(-10)
    const earlier = history.slice(-20, -10)

    if (recent.length === 0 || earlier.length === 0) return "stable"

    const recentAvg =
      recent.reduce((acc, curr) => acc + curr.overall, 0) / recent.length
    const earlierAvg =
      earlier.reduce((acc, curr) => acc + curr.overall, 0) / earlier.length

    if (recentAvg > earlierAvg + 5) return "improving"
    if (recentAvg < earlierAvg - 5) return "declining"
    return "stable"
  }, [history])

  return {
    currentScore,
    history,
    averageScore,
    trend,
    updateScore,
    resetScore,
  }
}
