export interface ConfidenceMetrics {
  eyeContact: number
  posture: number
  facialExpression: number
  voiceTone: number
  speechClarity: number
  overallConfidence: number
}

export interface SessionReport {
  sessionId: string
  communicationScore: number
  technicalScore: number
  confidenceScore: number
  overallScore: number
  strengths: string[]
  improvements: string[]
  suggestions: string[]
  summary: string
  detailedFeedback: string
}

export interface AnalyticsData {
  sessionId: string
  confidenceLog: Array<{
    timestamp: Date
    metrics: ConfidenceMetrics
  }>
  transcripts: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
  }>
  report: SessionReport | null
}
