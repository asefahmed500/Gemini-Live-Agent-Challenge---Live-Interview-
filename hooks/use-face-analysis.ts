"use client"

import { useState, useCallback, useRef, useEffect } from "react"

export interface FacialExpression {
  neutral: number
  happy: number
  sad: number
  angry: number
  fearful: number
  disgusted: number
  surprised: number
}

export interface FaceAnalysisResult {
  expressions: FacialExpression
  dominantExpression: string
  eyeContact: number
  faceDetected: boolean
  timestamp: Date
}

export interface SpeechAnalysisResult {
  wordsPerMinute: number
  fillerWordCount: number
  fillerWords: string[]
  clarityScore: number
  sentiment: "positive" | "neutral" | "negative"
  confidence: number
  timestamp: Date
}

export interface RealTimeAnalysisResult {
  facial: FaceAnalysisResult | null
  speech: SpeechAnalysisResult | null
  overallScore: number
  recommendations: string[]
}

const FILLER_WORDS = [
  "um",
  "uh",
  "like",
  "you know",
  "basically",
  "actually",
  "literally",
  "so",
  "well",
  "I mean",
]

interface FaceLandmarks {
  getLeftEye: () => Array<{ x: number; y: number }>
  getRightEye: () => Array<{ x: number; y: number }>
  getNose: () => Array<{ x: number; y: number }>
}

export function useFaceAnalysis() {
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentExpression, setCurrentExpression] = useState<FacialExpression>({
    neutral: 0,
    happy: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    disgusted: 0,
    surprised: 0,
  })
  const [eyeContactScore, setEyeContactScore] = useState(0)
  const [faceDetected, setFaceDetected] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const loadModels = useCallback(async () => {
    try {
      const faceapi = await import("face-api.js")
      const { areModelsAvailable } = await import("@/lib/face-analyzer-fallback")

      const MODEL_URL = "/models"

      // Check if models are available
      const modelsExist = await areModelsAvailable()

      if (!modelsExist) {
        console.warn("Face analysis models not found. Using simulation mode.")
        console.info("To enable real face analysis, download models from:")
        console.info("https://github.com/justadudewhohacks/face-api.js#model-files")
        console.info("Place them in: /public/models/")
        // Use simulation mode
        setIsModelLoaded(true)
        return
      }

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ])

      setIsModelLoaded(true)
    } catch (error) {
      console.error("Failed to load face detection models:", error)
      // Fall back to simulation mode
      setIsModelLoaded(true)
    }
  }, [])

  const startAnalysis = useCallback(
    async (video: HTMLVideoElement) => {
      if (!isModelLoaded) {
        await loadModels()
      }

      videoRef.current = video
      setIsAnalyzing(true)

      const detect = async () => {
        if (!videoRef.current || !isModelLoaded) {
          animationFrameRef.current = requestAnimationFrame(detect)
          return
        }

        try {
          const faceapi = await import("face-api.js")

          const detections = await faceapi
            .detectSingleFace(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks()
            .withFaceExpressions()

          if (detections) {
            setFaceDetected(true)

            const expressions = detections.expressions as FacialExpression
            setCurrentExpression(expressions)

            const landmarks = detections.landmarks as FaceLandmarks
            const eyeContact = calculateEyeContact(landmarks)
            setEyeContactScore(eyeContact)
          } else {
            setFaceDetected(false)
            setEyeContactScore(0)
          }
        } catch (error) {
          console.error("Face detection error:", error)
        }

        animationFrameRef.current = requestAnimationFrame(detect)
      }

      detect()
    },
    [isModelLoaded, loadModels]
  )

  const stopAnalysis = useCallback(() => {
    setIsAnalyzing(false)
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      stopAnalysis()
    }
  }, [stopAnalysis])

  const getDominantExpression = useCallback(() => {
    const expressions = Object.entries(currentExpression)
    const sorted = expressions.sort(([, a], [, b]) => b - a)
    return sorted[0]?.[0] || "neutral"
  }, [currentExpression])

  return {
    isModelLoaded,
    isAnalyzing,
    currentExpression,
    eyeContactScore,
    faceDetected,
    dominantExpression: getDominantExpression(),
    loadModels,
    startAnalysis,
    stopAnalysis,
  }
}

function calculateEyeContact(landmarks: FaceLandmarks): number {
  try {
    const leftEye = landmarks.getLeftEye()
    const rightEye = landmarks.getRightEye()

    const leftEyeCenter = {
      x: leftEye.reduce((sum, p) => sum + p.x, 0) / leftEye.length,
      y: leftEye.reduce((sum, p) => sum + p.y, 0) / leftEye.length,
    }

    const rightEyeCenter = {
      x: rightEye.reduce((sum, p) => sum + p.x, 0) / rightEye.length,
      y: rightEye.reduce((sum, p) => sum + p.y, 0) / rightEye.length,
    }

    const nose = landmarks.getNose()
    const noseTip = nose[Math.floor(nose.length / 2)]

    const faceWidth = Math.abs(rightEyeCenter.x - leftEyeCenter.x)
    const eyeCenterX = (leftEyeCenter.x + rightEyeCenter.x) / 2
    const offsetFromCenter = Math.abs(eyeCenterX - noseTip.x)

    const normalizedOffset = offsetFromCenter / (faceWidth / 2)
    const eyeContact = Math.max(0, Math.min(100, (1 - normalizedOffset) * 100))

    return Math.round(eyeContact)
  } catch {
    return 50
  }
}

export function useSpeechAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState<SpeechAnalysisResult>({
    wordsPerMinute: 0,
    fillerWordCount: 0,
    fillerWords: [],
    clarityScore: 0,
    sentiment: "neutral",
    confidence: 0,
    timestamp: new Date(),
  })

  const transcriptRef = useRef<string>("")
  const startTimeRef = useRef<number>(0)

  const startAnalysis = useCallback(() => {
    setIsAnalyzing(true)
    transcriptRef.current = ""
    startTimeRef.current = Date.now()
  }, [])

  const stopAnalysis = useCallback(() => {
    setIsAnalyzing(false)
  }, [])

  const addTranscript = useCallback((text: string) => {
    transcriptRef.current += " " + text

    const words = text.toLowerCase().split(/\s+/)
    const fillerWordsFound = words.filter((word) =>
      FILLER_WORDS.includes(word.replace(/[.,!?]/g, ""))
    )

    const elapsedMinutes = (Date.now() - startTimeRef.current) / 60000
    const wpm =
      elapsedMinutes > 0
        ? Math.round(transcriptRef.current.split(/\s+/).length / elapsedMinutes)
        : 0

    const clarityScore = calculateClarityScore(
      words,
      fillerWordsFound.length,
      wpm
    )

    setCurrentAnalysis({
      wordsPerMinute: wpm,
      fillerWordCount: fillerWordsFound.length,
      fillerWords: fillerWordsFound,
      clarityScore,
      sentiment: analyzeSentiment(text),
      confidence: clarityScore,
      timestamp: new Date(),
    })
  }, [])

  useEffect(() => {
    return () => {
      stopAnalysis()
    }
  }, [stopAnalysis])

  return {
    isAnalyzing,
    currentAnalysis,
    startAnalysis,
    stopAnalysis,
    addTranscript,
  }
}

function calculateClarityScore(
  words: string[],
  fillerCount: number,
  wpm: number
): number {
  let score = 100

  const optimalWpm = 130
  const wpmDiff = Math.abs(wpm - optimalWpm)
  score -= Math.min(20, wpmDiff * 0.15)

  score -= fillerCount * 3

  const longWords = words.filter((w) => w.length > 8).length
  const complexityPenalty = Math.min(15, longWords * 0.5)
  score -= complexityPenalty

  return Math.max(0, Math.min(100, Math.round(score)))
}

function analyzeSentiment(text: string): "positive" | "neutral" | "negative" {
  const positiveWords = [
    "good",
    "great",
    "excellent",
    "amazing",
    "love",
    "happy",
    "confident",
    "success",
    "achieve",
  ]
  const negativeWords = [
    "bad",
    "poor",
    "fail",
    "mistake",
    "wrong",
    "difficult",
    "hard",
    "struggle",
    "problem",
    "issue",
  ]

  const words = text.toLowerCase().split(/\s+/)
  let positiveCount = 0
  let negativeCount = 0

  words.forEach((word) => {
    if (positiveWords.some((pw) => word.includes(pw))) positiveCount++
    if (negativeWords.some((nw) => word.includes(nw))) negativeCount++
  })

  if (positiveCount > negativeCount + 2) return "positive"
  if (negativeCount > positiveCount + 2) return "negative"
  return "neutral"
}

export function useRealTimeAnalysis() {
  const faceAnalysis = useFaceAnalysis()
  const speechAnalysis = useSpeechAnalysis()

  const getAnalysis = useCallback((): RealTimeAnalysisResult => {
    const recommendations: string[] = []

    if (faceAnalysis.eyeContactScore < 50) {
      recommendations.push("Maintain better eye contact with the camera")
    }

    if (faceAnalysis.currentExpression.sad > 0.3) {
      recommendations.push("Try to appear more engaged and positive")
    }

    if (speechAnalysis.currentAnalysis.fillerWordCount > 5) {
      recommendations.push("Reduce use of filler words like 'um', 'uh', 'like'")
    }

    if (speechAnalysis.currentAnalysis.wordsPerMinute > 160) {
      recommendations.push("Try to slow down your speaking pace")
    }

    if (speechAnalysis.currentAnalysis.wordsPerMinute < 100) {
      recommendations.push("Try to speak a bit faster to maintain engagement")
    }

    if (speechAnalysis.currentAnalysis.clarityScore < 60) {
      recommendations.push("Work on speaking more clearly")
    }

    const facialScore = faceAnalysis.faceDetected
      ? (faceAnalysis.eyeContactScore +
          faceAnalysis.currentExpression.happy * 100 +
          faceAnalysis.currentExpression.neutral * 50) /
        3
      : 0

    const speechScore = speechAnalysis.currentAnalysis.clarityScore

    const overallScore = Math.round(facialScore * 0.4 + speechScore * 0.6)

    return {
      facial: faceAnalysis.faceDetected
        ? {
            expressions: faceAnalysis.currentExpression,
            dominantExpression: faceAnalysis.dominantExpression,
            eyeContact: faceAnalysis.eyeContactScore,
            faceDetected: faceAnalysis.faceDetected,
            timestamp: new Date(),
          }
        : null,
      speech: speechAnalysis.currentAnalysis,
      overallScore: Math.min(100, overallScore),
      recommendations,
    }
  }, [faceAnalysis, speechAnalysis])

  return {
    ...faceAnalysis,
    ...speechAnalysis,
    getAnalysis,
  }
}
