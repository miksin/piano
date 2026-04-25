import { useCallback, useEffect, useRef, useState } from 'react'
import { AudioEngine } from '../audio/audioEngine'
import { pianoInstrument } from '../audio/instruments'

export interface AudioEngineHook {
  playNote: (note: string, velocity?: number) => void
  stopNote: (note: string) => void
  isReady: boolean
  setVolume: (volume: number) => void
  setTimbre: (timbre: OscillatorType) => void
}

export function useAudioEngine(): AudioEngineHook {
  const engineRef = useRef<AudioEngine | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Lazily create engine
  if (!engineRef.current) {
    engineRef.current = new AudioEngine(pianoInstrument)
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
  }, [])

  const setTimbre = useCallback((timbre: OscillatorType) => {
    engineRef.current?.setTimbre(timbre)
  }, [])

  return { playNote, stopNote, isReady, setVolume, setTimbre }
}

export default useAudioEngine
