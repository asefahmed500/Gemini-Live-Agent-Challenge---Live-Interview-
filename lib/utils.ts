import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function calculateOverallScore(scores: {
  confidence?: number
  communication?: number
  technical?: number
}): number {
  const weights = {
    confidence: 0.3,
    communication: 0.35,
    technical: 0.35,
  }

  let total = 0
  let weight = 0

  if (scores.confidence !== undefined) {
    total += scores.confidence * weights.confidence
    weight += weights.confidence
  }
  if (scores.communication !== undefined) {
    total += scores.communication * weights.communication
    weight += weights.communication
  }
  if (scores.technical !== undefined) {
    total += scores.technical * weights.technical
    weight += weights.technical
  }

  return weight > 0 ? Math.round(total / weight) : 0
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-yellow-500'
  return 'text-red-500'
}

export function getScoreGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}
