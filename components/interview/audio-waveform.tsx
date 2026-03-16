"use client"

import { useEffect, useRef } from "react"

interface AudioWaveformProps {
  stream: MediaStream | null
  className?: string
}

export function AudioWaveform({ stream, className }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!stream) return

    const audioContext = new AudioContext()
    const source = audioContext.createMediaStreamSource(stream)
    const analyser = audioContext.createAnalyser()

    analyser.fftSize = 256
    analyserRef.current = analyser
    source.connect(analyser)

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)

      analyser.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height

        // Create gradient
        const gradient = ctx.createLinearGradient(
          0,
          canvas.height - barHeight,
          0,
          canvas.height
        )
        gradient.addColorStop(0, "rgb(108, 99, 255)") // Primary color
        gradient.addColorStop(1, "rgb(0, 212, 170)") // Accent color

        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

        x += barWidth + 1
      }
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      source.disconnect()
      audioContext.close()
    }
  }, [stream])

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        width={300}
        height={60}
        className="h-full w-full"
      />
    </div>
  )
}
