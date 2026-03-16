"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface UseTextToSpeechOptions {
  voice?: string
  rate?: number
  pitch?: number
  volume?: number
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: string) => void
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const {
    voice,
    rate = 1,
    pitch = 1,
    volume = 1,
    onStart,
    onEnd,
    onError,
  } = options

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported] = useState(() => {
    if (typeof window === "undefined") return false
    return !!window.speechSynthesis
  })
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(
    null
  )

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      setVoices(availableVoices)

      if (voice) {
        const selectedVoice = availableVoices.find(
          (v) => v.name.includes(voice) || v.voiceURI.includes(voice)
        )
        if (selectedVoice) {
          setCurrentVoice(selectedVoice)
        }
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.cancel()
    }
  }, [voice])

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) {
        console.warn("Text-to-speech not supported")
        return
      }

      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.volume = volume

      if (currentVoice) {
        utterance.voice = currentVoice
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
        onStart?.()
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        onEnd?.()
      }

      utterance.onerror = (event) => {
        console.error("TTS error:", event.error)
        setIsSpeaking(false)
        onError?.(event.error)
      }

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [isSupported, rate, pitch, volume, currentVoice, onStart, onEnd, onError]
  )

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isSupported])

  const pause = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.pause()
    }
  }, [isSupported])

  const resume = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.resume()
    }
  }, [isSupported])

  return {
    isSpeaking,
    isSupported,
    voices,
    speak,
    stop,
    pause,
    resume,
    setCurrentVoice,
  }
}
