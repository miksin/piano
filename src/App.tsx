import React from 'react'
import { useAudioEngine } from './hooks/useAudioEngine'

// PianoKeyboard component will be added in Issue #2
// import PianoKeyboard from './components/PianoKeyboard'

export default function App(): React.JSX.Element {
  const { playNote, stopNote, isReady } = useAudioEngine()

  return (
    <div className="app">
      <h1>Piano</h1>
      <p>Audio engine ready: {isReady ? '✅' : '⏳ (click a key to activate)'}</p>
      <div className="piano">
        {/* PianoKeyboard will go here — see issue #2 */}
        {/* Once available: <PianoKeyboard onNoteOn={playNote} onNoteOff={stopNote} /> */}
        <p>[Piano component will go here — see issue #2]</p>
      </div>
    </div>
  )
}
