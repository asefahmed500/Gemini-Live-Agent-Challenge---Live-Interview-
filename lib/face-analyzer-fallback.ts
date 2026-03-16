/**
 * Face Analysis Fallback Module
 *
 * This provides simulated face analysis when face-api.js models are not available.
 * To enable real face analysis, download the models from:
 * https://github.com/justadudewhohacks/face-api.js#model-files
 *
 * Required models:
 * - tiny_face_detector_model-weights_manifest.json
 * - tiny_face_detector-shard1
 * - face_landmark_68_model-weights_manifest.json
 * - face_landmark_68_model-shard1
 * - face_expression_model-weights_manifest.json
 * - face_expression_model-shard1
 *
 * Place them in: /public/models/
 */

import { FacialExpression, FaceAnalysisResult } from "@/hooks/use-face-analysis"

export interface SimulationConfig {
  enabled: boolean
  realism: number // 0-1, higher = more realistic variations
}

const DEFAULT_EXPRESSION: FacialExpression = {
  neutral: 0.3,
  happy: 0.1,
  sad: 0.05,
  angry: 0.05,
  fearful: 0.05,
  disgusted: 0.05,
  surprised: 0.05,
}

/**
 * Simulates facial expression analysis based on interview context
 */
export function simulateFacialExpressions(
  context: "answering" | "listening" | "thinking",
  duration: number
): FacialExpression {
  const base = { ...DEFAULT_EXPRESSION }

  // Adjust based on context
  switch (context) {
    case "answering":
      base.happy += 0.2
      base.surprised += 0.1
      base.neutral -= 0.15
      break
    case "listening":
      base.neutral += 0.3
      base.sad -= 0.02
      break
    case "thinking":
      base.neutral += 0.2
      base.surprised += 0.05
      base.happy -= 0.05
      break
  }

  // Add some natural variation
  const variation = 0.1
  const applyVariation = (value: number) =>
    Math.max(0, Math.min(1, value + (Math.random() - 0.5) * variation))

  return {
    neutral: applyVariation(base.neutral),
    happy: applyVariation(base.happy),
    sad: applyVariation(base.sad),
    angry: applyVariation(base.angry),
    fearful: applyVariation(base.fearful),
    disgusted: applyVariation(base.disgusted),
    surprised: applyVariation(base.surprised),
  }
}

/**
 * Simulates eye contact tracking
 */
export function simulateEyeContact(
  context: "answering" | "listening" | "thinking",
  timeInState: number
): number {
  let baseScore = 70 // Good baseline

  // Adjust based on context
  switch (context) {
    case "answering":
      baseScore = 75 + Math.random() * 15
      break
    case "listening":
      baseScore = 80 + Math.random() * 10
      break
    case "thinking":
      // More variation when thinking (looking away)
      baseScore = 60 + Math.random() * 25
      break
  }

  // Natural decay over time in same state
  const decay = Math.min(10, timeInState / 1000) // Max 10 point drop
  baseScore -= decay

  // Occasional breaks (realistic)
  if (Math.random() < 0.05) {
    baseScore -= 15 + Math.random() * 20
  }

  return Math.max(0, Math.min(100, baseScore))
}

/**
 * Creates a simulated face analysis result
 */
export function createSimulatedFaceAnalysis(
  context: "answering" | "listening" | "thinking" = "answering",
  timeInState: number = 0
): FaceAnalysisResult {
  const expressions = simulateFacialExpressions(context, timeInState)
  const eyeContact = simulateEyeContact(context, timeInState)

  // Find dominant expression
  const dominantExpression = (Object.entries(expressions) as Array<[string, number]>)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || "neutral"

  return {
    expressions,
    dominantExpression,
    eyeContact,
    faceDetected: true,
    timestamp: new Date(),
  }
}

/**
 * Checks if face-api.js models are available
 */
export async function areModelsAvailable(): Promise<boolean> {
  try {
    const modelUrls = [
      "/models/tiny_face_detector_model-weights_manifest.json",
      "/models/face_landmark_68_model-weights_manifest.json",
      "/models/face_expression_model-weights_manifest.json",
    ]

    const results = await Promise.all(
      modelUrls.map(async (url) => {
        try {
          const response = await fetch(url)
          return response.ok
        } catch {
          return false
        }
      })
    )

    return results.every((r) => r)
  } catch {
    return false
  }
}
