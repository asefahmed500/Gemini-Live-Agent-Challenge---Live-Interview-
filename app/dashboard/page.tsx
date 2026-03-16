"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Play, Target } from "lucide-react"
import Link from "next/link"
import { formatDate, getScoreColor, getScoreGrade } from "@/lib/utils"

interface InterviewSession {
  id: string
  jobRole: string
  difficulty: string
  status: string
  startedAt: string
  endedAt: string | null
  overallScore: number | null
  confidenceScore: number | null
  communicationScore: number | null
  technicalScore: number | null
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions")
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions)
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error)
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

  const completedSessions = sessions.filter((s) => s.status === "completed")
  const averageScore =
    completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) /
        completedSessions.length
      : 0

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Your interview practice sessions
          </p>
        </div>
        <Link href="/interview">
          <Button>
            <Play className="mr-2 h-4 w-4" />
            New Interview
          </Button>
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Avg Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getScoreColor(averageScore)}`}
            >
              {completedSessions.length > 0 ? Math.round(averageScore) : "-"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Grade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedSessions.length > 0 ? getScoreGrade(averageScore) : "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="py-12 text-center">
              <Target className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <p className="mb-4 text-muted-foreground">No interviews yet</p>
              <Link href="/interview">
                <Button>Start Interview</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((sessionData) => (
                <SessionCard key={sessionData.id} session={sessionData} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SessionCard({ session }: { session: InterviewSession }) {
  const isCompleted = session.status === "completed"

  return (
    <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/30">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <span className="text-sm font-medium text-primary">
            {session.jobRole.charAt(0)}
          </span>
        </div>
        <div>
          <p className="font-medium">{session.jobRole}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDate(session.startedAt)}</span>
            <Badge variant="outline" className="text-xs">
              {session.difficulty}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isCompleted && session.overallScore !== null ? (
          <div className="text-right">
            <div
              className={`text-xl font-bold ${getScoreColor(session.overallScore)}`}
            >
              {Math.round(session.overallScore)}
            </div>
            <div className="text-xs text-muted-foreground">Score</div>
          </div>
        ) : (
          <Badge
            variant={session.status === "active" ? "default" : "secondary"}
          >
            {session.status}
          </Badge>
        )}

        <Link href={`/dashboard/${session.id}`}>
          <Button variant="outline" size="sm">
            {isCompleted ? "View" : "Continue"}
          </Button>
        </Link>
      </div>
    </div>
  )
}
