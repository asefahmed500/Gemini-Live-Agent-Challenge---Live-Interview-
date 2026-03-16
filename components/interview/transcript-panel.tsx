"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User, Bot } from "lucide-react"

export interface TranscriptEntry {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  confidence?: number
}

interface TranscriptPanelProps {
  transcripts: TranscriptEntry[]
  isLive?: boolean
  className?: string
}

export function TranscriptPanel({ transcripts, isLive = false, className }: TranscriptPanelProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Conversation</span>
          {isLive && (
            <Badge variant="outline" className="text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Live
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {transcripts.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                Start the interview to see the conversation here...
              </div>
            ) : (
              transcripts.map((entry, index) => (
                <TranscriptItem key={index} entry={entry} />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function TranscriptItem({ entry }: { entry: TranscriptEntry }) {
  const isUser = entry.role === "user"
  const isSystem = entry.role === "system"

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <Badge variant="outline" className="text-xs">
          {entry.content}
        </Badge>
      </div>
    )
  }

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? "bg-primary" : "bg-muted"
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
      <div className={`flex-1 space-y-1 ${isUser ? "text-right" : ""}`}>
        <div className="text-xs text-muted-foreground">
          {entry.timestamp.toLocaleTimeString()}
        </div>
        <div className={`inline-block rounded-lg px-3 py-2 text-sm ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}>
          {entry.content}
        </div>
        {entry.confidence !== undefined && (
          <div className="text-xs text-muted-foreground">
            Confidence: {Math.round(entry.confidence)}%
          </div>
        )}
      </div>
    </div>
  )
}
