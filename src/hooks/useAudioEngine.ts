import { useCallback, useEffect, useRef, useState } from 'react'
import { AudioEngine } from '../audio/audioEngine'
import { pianoInstrument } from '../audio/instruments'

export interface AudioEngineHook {
  playNote: (note: string, velocity?: number) => void
  stopNote: (note: string) => void
  isReady: boolean
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

  return { playNote, stopNote, isReady }
}

export default useAudioEngine
