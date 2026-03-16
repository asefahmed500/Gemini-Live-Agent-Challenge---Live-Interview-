"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { formatDate, getScoreColor, getScoreGrade } from "@/lib/utils"

interface SessionAnalytics {
  sessionId: string
  jobRole: string
  difficulty: string
  status: string
  startedAt: string
  endedAt: string | null
  scores: {
    overall: number | null
    confidence: number | null
    communication: number | null
    technical: number | null
  }
  transcripts: Array<{ role: string; content: string; timestamp: string }>
  confidenceLog: Array<{ timestamp: string; overallConfidence: number | null }>
  report: {
    id: string
    strengths: string[]
    improvements: string[]
    suggestions: string[]
    summary: string
    detailedFeedback: string
  } | null
}

export default function SessionReportPage() {
  const params = useParams()
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const sessionId = params.session_id as string

  useEffect(() => {
    if (sessionId) fetchAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  async function fetchAnalytics() {
    try {
      const response = await fetch(`/api/analytics/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">Session not found</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { scores, report } = analytics

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{analytics.jobRole}</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(analytics.startedAt)} · {analytics.difficulty}
          </p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <ScoreCard
          title="Overall"
          score={scores.overall}
          color={getScoreColor(scores.overall || 0)}
          grade={getScoreGrade(scores.overall || 0)}
        />
        <ScoreCard
          title="Communication"
          score={scores.communication}
          subtitle="Voice & Eye"
        />
        <ScoreCard
          title="Technical"
          score={scores.technical}
          subtitle="Answer Quality"
        />
        <ScoreCard
          title="Confidence"
          score={scores.confidence}
          subtitle="Body Language"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {report && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.strengths.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Badge
                        variant="outline"
                        className="mt-0.5 text-green-500"
                      >
                        +
                      </Badge>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Improve</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.improvements.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Badge
                        variant="outline"
                        className="mt-0.5 text-yellow-500"
                      >
                        -
                      </Badge>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.suggestions.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Badge variant="outline" className="mt-0.5">
                        →
                      </Badge>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {report && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{report.summary}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              {report.detailedFeedback}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 space-y-4 overflow-y-auto">
            {analytics.transcripts.map((entry, i) => (
              <div key={i} className="text-sm">
                <Badge variant="outline" className="mb-1 text-xs">
                  {entry.role}
                </Badge>
                <p className="text-muted-foreground">{entry.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ScoreCard({
  title,
  score,
  subtitle,
  color,
  grade,
}: {
  title: string
  score: number | null
  subtitle?: string
  color?: string
  grade?: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {score !== null ? (
          <>
            <div
              className={`text-3xl font-bold ${color || getScoreColor(score)}`}
            >
              {Math.round(score)}
            </div>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
            {grade && (
              <Badge variant="outline" className="mt-2 text-xs">
                Grade {grade}
              </Badge>
            )}
          </>
        ) : (
          <div className="text-2xl font-bold text-muted-foreground">-</div>
        )}
      </CardContent>
    </Card>
  )
}
