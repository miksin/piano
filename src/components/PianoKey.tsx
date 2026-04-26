import React from 'react'
import * as Tone from 'tone'
import type { PianoKeyProps } from '../types/piano'
import './Piano.css'

export default function PianoKey({
  keyData,
  isActive,
  showNoteLabel,
  showShortcutLabel,
  onNoteOn,
  onNoteOff,
}: PianoKeyProps): React.JSX.Element {
  const { note, isBlack, shortcut } = keyData
  const noteName = note.replace(/\d/, '')

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    onNoteOn(note, 100)
  }
  const handleMouseUp = () => onNoteOff(note)
  const handleMouseLeave = () => {
    if (isActive) onNoteOff(note)
  }

  return (
    <button
      className={`piano-key ${isBlack ? 'piano-key--black' : 'piano-key--white'} ${isActive ? 'piano-key--active' : ''}`}
      aria-label={note}
      aria-pressed={isActive}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={async (e) => {
        // Prevent 300ms mobile click delay and ensure AudioContext is started in touch gesture
        e.preventDefault()
        try {
          await Tone.start()
        } catch {
          // ignore startup errors; Tone may already be started or unavailable in test env
        }
        onNoteOn(note, 100)
      }}
      onTouchEnd={() => onNoteOff(note)}
      onTouchCancel={() => onNoteOff(note)}
    >
      <span className="piano-key__labels">
        {showShortcutLabel && shortcut && (
          <span className="piano-key__shortcut">{shortcut}</span>
        )}
        {showNoteLabel && !isBlack && (
          <span className="piano-key__note">{noteName}</span>
        )}
      </span>
    </button>
  )
}
