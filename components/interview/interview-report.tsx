"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Target,
  Eye,
  Volume2,
  RefreshCw,
} from "lucide-react"

interface ReportData {
  overallScore: number
  communicationScore: number
  confidenceScore: number
  technicalScore: number
  strengths: string[]
  improvements: string[]
  suggestions: string[]
  summary: string
  detailedFeedback: string
}

interface AnalysisData {
  bodyLanguage?: {
    eyeContact: string
    posture: string
    expressions: string
    overall: string
  }
  communicationStyle?: {
    clarity: string
    pace: string
    tone: string
    overall: string
  }
  keyObservations?: string[]
}

interface InterviewReportProps {
  sessionId: string
}

export function InterviewReport({ sessionId }: InterviewReportProps) {
  const [report, setReport] = useState<ReportData | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  const fetchReport = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics/${sessionId}`)
      const data = await response.json()

      if (data.report) {
        setReport(data.report)
      }
      if (data.analysis) {
        setAnalysis(data.analysis)
      }
    } catch (error) {
      console.error("Failed to fetch report:", error)
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchReport()
  }, [sessionId, fetchReport])

  const generateAnalysis = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch(`/api/analytics/${sessionId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (data.report) {
        setReport(data.report)
      }
      if (data.analysis) {
        setAnalysis(data.analysis)
      }
    } catch (error) {
      console.error("Failed to generate analysis:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            Loading report...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!report) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
            <h3 className="mb-2 text-lg font-semibold">No Report Available</h3>
            <p className="mb-4 text-muted-foreground">
              Generate an AI-powered analysis of your interview performance.
            </p>
            <Button onClick={generateAnalysis} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate Analysis"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div
                className={`text-4xl font-bold ${getScoreColor(report.overallScore)}`}
              >
                {report.overallScore}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">Overall</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div
                className={`text-4xl font-bold ${getScoreColor(report.communicationScore)}`}
              >
                {report.communicationScore}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Communication
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div
                className={`text-4xl font-bold ${getScoreColor(report.confidenceScore)}`}
              >
                {report.confidenceScore}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Confidence
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div
                className={`text-4xl font-bold ${getScoreColor(report.technicalScore)}`}
              >
                {report.technicalScore}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Technical
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{report.summary}</p>
          <p className="mt-4 text-muted-foreground">
            {report.detailedFeedback}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>{strength}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.improvements.map((improvement, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                  <span>{improvement}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-blue-500" />
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {(analysis?.bodyLanguage || analysis?.communicationStyle) && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Analysis</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {analysis?.bodyLanguage && (
              <div>
                <h4 className="mb-3 flex items-center gap-2 font-medium">
                  <Eye className="h-4 w-4" />
                  Body Language
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Eye Contact:</span>
                    <span>{analysis.bodyLanguage.eyeContact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Posture:</span>
                    <span>{analysis.bodyLanguage.posture}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expressions:</span>
                    <span>{analysis.bodyLanguage.expressions}</span>
                  </div>
                </div>
              </div>
            )}

            {analysis?.communicationStyle && (
              <div>
                <h4 className="mb-3 flex items-center gap-2 font-medium">
                  <Volume2 className="h-4 w-4" />
                  Communication Style
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clarity:</span>
                    <span>{analysis.communicationStyle.clarity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pace:</span>
                    <span>{analysis.communicationStyle.pace}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tone:</span>
                    <span>{analysis.communicationStyle.tone}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {analysis?.keyObservations && analysis.keyObservations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Key Observations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-2">
              {analysis.keyObservations.map((observation, index) => (
                <li key={index}>{observation}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={generateAnalysis}
          disabled={isGenerating}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`}
          />
          {isGenerating ? "Regenerating..." : "Regenerate Analysis"}
        </Button>
      </div>
    </div>
  )
}
