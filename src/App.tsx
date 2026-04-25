import React from 'react'
import PianoKeyboard from './components/PianoKeyboard'
import { useAudioEngine } from './hooks/useAudioEngine'

export default function App(): React.JSX.Element {
  const { playNote, stopNote } = useAudioEngine()
  return (
    <div className="app">
      <h1>Piano</h1>
      <PianoKeyboard
        baseOctave={3}
        octaves={2}
        showNoteLabels={true}
        showShortcutLabels={true}
        onNoteOn={playNote}
        onNoteOff={stopNote}
      />
    </div>
  )
}
