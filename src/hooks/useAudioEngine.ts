import { useCallback, useEffect, useRef, useState } from 'react'
import { SamplerEngine } from '../audio/samplerEngine'

export interface AudioEngineHook {
  playNote: (note: string, velocity?: number) => void
  stopNote: (note: string) => void
  isReady: boolean
  volume: number
  timbre: OscillatorType
  setVolume: (volume: number) => void
  setTimbre: (timbre: OscillatorType) => void
}

export function useAudioEngine(): AudioEngineHook {
  const engineRef = useRef<SamplerEngine | null>(null)
  const [isReady, setIsReady] = useState(false)
  // UI state mirrors engine state for synchronization
  const [volume, setVolumeState] = useState<number>(0.7)
  const [timbre, setTimbreState] = useState<OscillatorType>('triangle')

  // Lazily create engine
  if (!engineRef.current) {
    engineRef.current = new SamplerEngine()
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      engineRef.current?.dispose()
      engineRef.current = null
    }
  }, [])

  const ensureReady = useCallback(async () => {
    const engine = engineRef.current
    if (!engine) return
    if (!engine.isReady) {
      await engine.initialize()
      setIsReady(engine.isReady)
    }
  }, [])

  const playNote = useCallback(
    async (note: string, velocity?: number) => {
      await ensureReady()
      engineRef.current?.playNote(note, velocity)
      if (!isReady) setIsReady(engineRef.current?.isReady ?? false)
    },
    [ensureReady, isReady]
  )

  const stopNote = useCallback((note: string) => {
    engineRef.current?.stopNote(note)
  }, [])

  const setVolume = useCallback((volume: number) => {
    engineRef.current?.setVolume(volume)
    setVolumeState(volume)
  }, [])

  const setTimbre = useCallback((timbre: OscillatorType) => {
    // No-op for sampler engine; keep API compatibility
    engineRef.current?.setTimbre(timbre)
    setTimbreState(timbre)
  }, [])

  return {
    playNote,
    stopNote,
    isReady,
    volume,
    timbre,
    setVolume,
    setTimbre,
  }
}

export default useAudioEngine
