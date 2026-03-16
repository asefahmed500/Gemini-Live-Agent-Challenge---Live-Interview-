export type MessageType = 'audio' | 'video' | 'transcript' | 'confidence' | 'control' | 'error'

export interface BaseMessage {
  type: MessageType
  timestamp: number
}

export interface AudioMessage extends BaseMessage {
  type: 'audio'
  data: ArrayBuffer // PCM audio data
  format: 'pcm' | 'wav'
  sampleRate: number
  channels: number
}

export interface VideoMessage extends BaseMessage {
  type: 'video'
  data: string // Base64 encoded JPEG
}

export interface TranscriptMessage extends BaseMessage {
  type: 'transcript'
  role: 'user' | 'assistant' | 'system'
  content: string
  confidence?: number
}

export interface ConfidenceMessage extends BaseMessage {
  type: 'confidence'
  metrics: {
    eyeContact?: number
    posture?: number
    facialExpression?: number
    voiceTone?: number
    speechClarity?: number
    overall: number
  }
}

export interface ControlMessage extends BaseMessage {
  type: 'control'
  action: 'start' | 'stop' | 'pause' | 'resume'
  sessionId?: string
}

export interface ErrorMessage extends BaseMessage {
  type: 'error'
  code: string
  message: string
}

export type WebSocketMessage =
  | AudioMessage
  | VideoMessage
  | TranscriptMessage
  | ConfidenceMessage
  | ControlMessage
  | ErrorMessage

export type ClientToServerMessage =
  | AudioMessage
  | VideoMessage
  | ControlMessage

export type ServerToClientMessage =
  | AudioMessage
  | TranscriptMessage
  | ConfidenceMessage
  | ErrorMessage
