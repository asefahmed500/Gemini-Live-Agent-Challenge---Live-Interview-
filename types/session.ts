export interface InterviewSession {
  id: string
  userId: string
  jobRole: string
  difficulty: 'easy' | 'medium' | 'hard'
  status: 'created' | 'active' | 'completed' | 'cancelled'
  startedAt: Date
  endedAt: Date | null
  overallScore: number | null
  confidenceScore: number | null
  communicationScore: number | null
  technicalScore: number | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateSessionInput {
  jobRole: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

export interface SessionResponse {
  sessionId: string
  status: string
  websocketUrl: string
  token: string
}
