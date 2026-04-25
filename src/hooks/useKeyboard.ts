import { useEffect, useCallback } from 'react'

// Fixed mapping for 2 octaves starting C3
const KEY_TO_NOTE: Record<string, string> = {
  z: 'C3', s: 'C#3', x: 'D3', d: 'D#3', c: 'E3',
  v: 'F3', g: 'F#3', b: 'G3', h: 'G#3', n: 'A3', j: 'A#3', m: 'B3',
  q: 'C4', '2': 'C#4', w: 'D4', '3': 'D#4', e: 'E4',
  r: 'F4', '5': 'F#4', t: 'G4', '6': 'G#4', y: 'A4', '7': 'A#4', u: 'B4',
}

export const NOTE_TO_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(KEY_TO_NOTE).map(([k, v]) => [v, k])
)

export function useKeyboard(
  onNoteOn: (note: string, velocity: number) => void,
  onNoteOff: (note: string) => void
) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.repeat) return
    const note = KEY_TO_NOTE[e.key.toLowerCase()]
    if (note) onNoteOn(note, 100)
  }, [onNoteOn])

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const note = KEY_TO_NOTE[e.key.toLowerCase()]
    if (note) onNoteOff(note)
  }, [onNoteOff])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])
}
