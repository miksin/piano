import React from 'react'
import PianoKeyboard from './components/PianoKeyboard'
import { useAudioEngine } from './hooks/useAudioEngine'
import { useMidi } from './hooks/useMidi'
import AudioControls from './components/AudioControls'

export default function App(): React.JSX.Element {
  const { playNote, stopNote } = useAudioEngine()
  const { isSupported, isConnected } = useMidi({ onNoteOn: playNote, onNoteOff: stopNote })
  
  return (
    <div className="app">
      <h1>Piano</h1>
      <AudioControls />
      {isSupported && (
        <div className="midi-status">
          MIDI: {isConnected ? '🎹 Connected' : 'No device'}
        </div>
      )}
      <PianoKeyboard
        baseOctave={3}
        octaves={3}
        showNoteLabels={true}
        showShortcutLabels={true}
        onNoteOn={playNote}
        onNoteOff={stopNote}
      />
    </div>
  )
}
