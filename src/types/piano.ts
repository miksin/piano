export interface PianoKeyData {
  note: string        // e.g. "C3", "C#3"
  isBlack: boolean
  octave: number
  shortcut?: string
}

export interface PianoKeyProps {
  keyData: PianoKeyData
  isActive: boolean
  showNoteLabel?: boolean
  showShortcutLabel?: boolean
  onNoteOn: (note: string, velocity: number) => void
  onNoteOff: (note: string) => void
}

export interface PianoKeyboardProps {
  baseOctave?: number
  octaves?: number
  showNoteLabels?: boolean
  showShortcutLabels?: boolean
  onNoteOn?: (note: string, velocity: number) => void
  onNoteOff?: (note: string) => void
}
