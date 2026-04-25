import React, { useState, useCallback } from 'react'
import PianoKey from './PianoKey'
import { useKeyboard, NOTE_TO_KEY } from '../hooks/useKeyboard'
import type { PianoKeyboardProps, PianoKeyData } from '../types/piano'
import './Piano.css'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function buildKeys(baseOctave: number, octaves: number): PianoKeyData[] {
  const keys: PianoKeyData[] = []
  for (let o = 0; o < octaves; o++) {
    const octave = baseOctave + o
    for (const name of NOTE_NAMES) {
      const note = `${name}${octave}`
      const isBlack = name.includes('#')
      keys.push({ note, isBlack, octave, shortcut: NOTE_TO_KEY[note] })
    }
  }
  return keys
}

export default function PianoKeyboard({
  baseOctave = 3,
  octaves = 2,
  showNoteLabels = true,
  showShortcutLabels = true,
  onNoteOn,
  onNoteOff,
}: PianoKeyboardProps): React.JSX.Element {
  const [currentBase, setCurrentBase] = useState(baseOctave)
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set())

  const handleNoteOn = useCallback((note: string, velocity: number) => {
    setActiveNotes(prev => new Set([...prev, note]))
    onNoteOn?.(note, velocity)
  }, [onNoteOn])

  const handleNoteOff = useCallback((note: string) => {
    setActiveNotes(prev => {
      const next = new Set(prev)
      next.delete(note)
      return next
    })
    onNoteOff?.(note)
  }, [onNoteOff])

  useKeyboard(handleNoteOn, handleNoteOff)

  const keys = buildKeys(currentBase, octaves)
  const lastOctave = currentBase + octaves - 1
  const rangeLabel = `C${currentBase} – B${lastOctave}`

  // Separate white and black keys for rendering
  const whiteKeys = keys.filter(k => !k.isBlack)
  const blackKeys = keys.filter(k => k.isBlack)

  // Calculate black key positions (offset from left in units of white key widths)
  // We need to track white key index for each black key
  const blackKeyPositions: { key: PianoKeyData; whiteIndex: number }[] = []
  let whiteIdx = 0
  for (const k of keys) {
    if (!k.isBlack) {
      whiteIdx++
    } else {
      // black key sits between previous white key and next
      blackKeyPositions.push({ key: k, whiteIndex: whiteIdx - 0.5 })
    }
  }

  return (
    <div className="piano-keyboard-wrapper">
      <div className="piano-octave-controls">
        <button onClick={() => setCurrentBase(b => Math.max(0, b - 1))}>◀</button>
        <span className="piano-octave-label">{rangeLabel}</span>
        <button onClick={() => setCurrentBase(b => Math.min(8, b + 1))}>▶</button>
      </div>
      <div className="piano-keys" style={{ position: 'relative' }}>
        {/* White keys */}
        {whiteKeys.map(k => (
          <PianoKey
            key={k.note}
            keyData={k}
            isActive={activeNotes.has(k.note)}
            showNoteLabel={showNoteLabels}
            showShortcutLabel={showShortcutLabels}
            onNoteOn={handleNoteOn}
            onNoteOff={handleNoteOff}
          />
        ))}
        {/* Black keys overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {blackKeyPositions.map(({ key: k, whiteIndex }) => (
            <div
              key={k.note}
              style={{
                position: 'absolute',
                left: `calc(${whiteIndex} * var(--piano-white-key-width))`,
                top: 0,
                transform: 'translateX(-50%)',
                pointerEvents: 'auto',
                zIndex: 2,
              }}
            >
              <PianoKey
                keyData={k}
                isActive={activeNotes.has(k.note)}
                showNoteLabel={false}
                showShortcutLabel={showShortcutLabels}
                onNoteOn={handleNoteOn}
                onNoteOff={handleNoteOff}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
