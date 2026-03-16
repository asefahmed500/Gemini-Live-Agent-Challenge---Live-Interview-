"use client"

import { useEffect, useRef, useState } from "react"

export function useAudioPlayback() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioQueueRef = useRef<Float32Array[]>([])
  const isPlayingRef = useRef(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({
        sampleRate: 24000,
      })
    }
    return audioContextRef.current
  }

  const playAudio = async (audioData: Float32Array) => {
    const audioContext = initAudioContext()

    // Resume audio context if suspended (required for some browsers)
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    // Add to queue
    audioQueueRef.current.push(audioData)

    // Start playing if not already playing
    if (!isPlayingRef.current) {
      playNextChunk()
    }
  }

  const playNextChunk = async () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false
      setIsPlaying(false)
      return
    }

    isPlayingRef.current = true
    setIsPlaying(true)

    const audioData = audioQueueRef.current.shift()!
    const audioContext = initAudioContext()

    const audioBuffer = audioContext.createBuffer(
      1,
      audioData.length,
      audioContext.sampleRate
    )
    // Use getChannelData to work around TypeScript strict type checking
    const channelData = audioBuffer.getChannelData(0)
    for (let i = 0; i < audioData.length; i++) {
      channelData[i] = audioData[i]
    }

    const source = audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioContext.destination)

    source.onended = () => {
      playNextChunk()
    }

    source.start()
  }

  const stop = () => {
    audioQueueRef.current = []
    isPlayingRef.current = false
    setIsPlaying(false)

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      stop()
    }
  }, [])

  return {
    isPlaying,
    playAudio,
    stop,
  }
}
