import React from 'react'
import PianoKeyboard from './components/PianoKeyboard'

export default function App(): React.JSX.Element {
  return (
    <div className="app">
      <h1>Piano</h1>
      <PianoKeyboard
        baseOctave={3}
        octaves={2}
        showNoteLabels={true}
        showShortcutLabels={true}
        onNoteOn={(note, velocity) => console.log('noteOn', note, velocity)}
        onNoteOff={(note) => console.log('noteOff', note)}
      />
    </div>
  )
}
