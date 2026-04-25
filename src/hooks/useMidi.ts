import { useEffect, useRef, useState } from 'react'

interface MidiOptions {
  onNoteOn: (note: string, velocity: number) => void
  onNoteOff: (note: string) => void
}

// MIDI note number to note name (e.g. 60 -> 'C4')
export function midiNoteToName(midiNote: number): string {
  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octave = Math.floor(midiNote / 12) - 1
  const note = NOTE_NAMES[midiNote % 12]
  return `${note}${octave}`
}

export function useMidi({ onNoteOn, onNoteOff }: MidiOptions): { isSupported: boolean; isConnected: boolean } {
  const isSupported = typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator
  const [isConnected, setIsConnected] = useState(false)
  const onNoteOnRef = useRef(onNoteOn)
  const onNoteOffRef = useRef(onNoteOff)

  useEffect(() => {
    onNoteOnRef.current = onNoteOn
    onNoteOffRef.current = onNoteOff
  })

  useEffect(() => {
    if (!isSupported) return

    let midiAccess: MIDIAccess | null = null

    const handleMidiMessage = (event: MIDIMessageEvent) => {
      const data = event.data
      if (!data || data.length < 3) return

      const status = data[0]
      const noteNumber = data[1]
      const velocity = data[2]
      const messageType = status & 0xf0

      const noteName = midiNoteToName(noteNumber)

      if (messageType === 0x90 && velocity > 0) {
        // Note On
        onNoteOnRef.current(noteName, velocity)
      } else if (messageType === 0x80 || (messageType === 0x90 && velocity === 0)) {
        // Note Off
        onNoteOffRef.current(noteName)
      }
    }

    const setupInputs = (access: MIDIAccess) => {
      access.inputs.forEach((input) => {
        input.onmidimessage = handleMidiMessage
      })
      setIsConnected(access.inputs.size > 0)
    }

    const handleStateChange = (access: MIDIAccess) => {
      setupInputs(access)
    }

    navigator.requestMIDIAccess().then((access) => {
      midiAccess = access
      setupInputs(access)
      access.onstatechange = () => handleStateChange(access)
    }).catch(() => {
      // MIDI access denied or unavailable
    })

    return () => {
      if (midiAccess) {
        midiAccess.inputs.forEach((input) => {
          input.onmidimessage = null
        })
        midiAccess.onstatechange = null
      }
    }
  }, [isSupported])

  return { isSupported, isConnected }
}
