/**
 * Audio Processor - Handle audio processing for Gemini Live API
 */

export interface AudioConfig {
  sampleRate: number
  channels: number
  frameSize: number
}

export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  sampleRate: 24000, // Gemini Live API expects 24kHz
  channels: 1,
  frameSize: 2400, // 100ms at 24kHz
}

/**
 * Convert Web Audio API AudioBuffer to PCM data
 */
export function audioBufferToPCM(buffer: AudioBuffer): Float32Array {
  const numberOfChannels = buffer.numberOfChannels
  const length = buffer.length
  const result = new Float32Array(length)

  // Mix all channels into one
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = buffer.getChannelData(channel)
    for (let i = 0; i < length; i++) {
      result[i] += channelData[i] / numberOfChannels
    }
  }

  return result
}

/**
 * Convert Float32Array to Int16Array (PCM 16-bit)
 */
export function floatToInt16(float32Array: Float32Array): Int16Array {
  const int16Array = new Int16Array(float32Array.length)

  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]))
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }

  return int16Array
}

/**
 * Convert Int16Array to Float32Array
 */
export function int16ToFloat32(int16Array: Int16Array): Float32Array {
  const float32Array = new Float32Array(int16Array.length)

  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / (int16Array[i] < 0 ? 0x8000 : 0x7fff)
  }

  return float32Array
}

/**
 * Resample audio data to target sample rate
 */
export function resampleAudio(
  audioData: Float32Array,
  originalSampleRate: number,
  targetSampleRate: number
): Float32Array {
  if (originalSampleRate === targetSampleRate) {
    return audioData
  }

  const ratio = originalSampleRate / targetSampleRate
  const newLength = Math.round(audioData.length / ratio)
  const result = new Float32Array(newLength)

  for (let i = 0; i < newLength; i++) {
    const srcIndex = Math.floor(i * ratio)
    result[i] = audioData[srcIndex]
  }

  return result
}

/**
 * Split audio into chunks of specified size
 */
export function chunkAudio(
  audioData: Float32Array,
  chunkSize: number
): Float32Array[] {
  const chunks: Float32Array[] = []

  for (let i = 0; i < audioData.length; i += chunkSize) {
    const end = Math.min(i + chunkSize, audioData.length)
    chunks.push(audioData.slice(i, end))
  }

  return chunks
}

/**
 * Apply noise gate to audio
 */
export function applyNoiseGate(
  audioData: Float32Array,
  threshold: number = 0.01,
  releaseTime: number = 100
): Float32Array {
  const result = new Float32Array(audioData.length)
  const releaseSamples = (releaseTime / 1000) * DEFAULT_AUDIO_CONFIG.sampleRate
  let gateOpen = false
  let releaseCounter = 0

  for (let i = 0; i < audioData.length; i++) {
    const amplitude = Math.abs(audioData[i])

    if (amplitude > threshold) {
      gateOpen = true
      releaseCounter = 0
    } else if (gateOpen) {
      releaseCounter++
      if (releaseCounter > releaseSamples) {
        gateOpen = false
      }
    }

    result[i] = gateOpen ? audioData[i] : 0
  }

  return result
}

/**
 * Calculate audio level for visualization
 */
export function getAudioLevel(audioData: Float32Array): number {
  let sum = 0
  for (let i = 0; i < audioData.length; i++) {
    sum += audioData[i] * audioData[i]
  }
  return Math.sqrt(sum / audioData.length) * 100
}

/**
 * Create AudioWorklet processor code (for real-time processing)
 */
export const AUDIO_WORKLET_CODE = `
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 2400; // 100ms at 24kHz
    this.buffer = new Float32Array(this.bufferSize);
    this.offset = 0;
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    if (input.length > 0) {
      const channel = input[0];

      for (let i = 0; i < channel.length; i++) {
        this.buffer[this.offset] = channel[i];
        this.offset++;

        if (this.offset >= this.bufferSize) {
          this.port.postMessage({
            type: 'audio',
            data: this.buffer.slice()
          });
          this.offset = 0;
        }
      }
    }

    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
`
