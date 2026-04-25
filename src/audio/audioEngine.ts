import { InstrumentConfig, pianoInstrument } from './instruments'

interface ActiveNote {
  oscillator: OscillatorNode
  oscillator2?: OscillatorNode
  gainNode: GainNode
}

/**
 * Converts a note string like 'C4', 'C#4', 'Bb3' to frequency in Hz.
 * Uses equal temperament: A4 = 440 Hz
 */
export function noteToFrequency(note: string): number {
  const noteMap: Record<string, number> = {
    C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3,
    E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8,
    Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
  }

  const match = note.match(/^([A-G][#b]?)(\d+)$/)
  if (!match) throw new Error(`Invalid note: ${note}`)

  const [, noteName, octaveStr] = match
  const semitone = noteMap[noteName]
  if (semitone === undefined) throw new Error(`Unknown note name: ${noteName}`)

  const octave = parseInt(octaveStr, 10)
  // MIDI note number: A4 = 69
  const midiNote = (octave + 1) * 12 + semitone
  return 440 * Math.pow(2, (midiNote - 69) / 12)
}

export class AudioEngine {
  private context: AudioContext | null = null
  private activeNotes: Map<string, ActiveNote> = new Map()
  private instrument: InstrumentConfig
  private volume: number = 1
  private timbre: OscillatorType

  constructor(instrument: InstrumentConfig = pianoInstrument) {
    this.instrument = instrument
    // Initialize timbre to the instrument's oscillator type
    this.timbre = instrument.oscillatorType
  }

  /** Initialize or resume AudioContext (must be called from user gesture) */
  async initialize(): Promise<void> {
    if (!this.context) {
      this.context = new AudioContext()
    }
    if (this.context.state === 'suspended') {
      await this.context.resume()
    }
  }

  get isReady(): boolean {
    return this.context?.state === 'running'
  }

  playNote(note: string, velocity: number = 1): void {
    if (!this.context || this.context.state !== 'running') return

    // Stop existing note with same key if already playing
    if (this.activeNotes.has(note)) {
      this.stopNote(note)
    }

    const ctx = this.context
    const { attack, decay, sustain, gainMultiplier, detune } = this.instrument
    const freq = noteToFrequency(note)
    const now = ctx.currentTime

    const gainNode = ctx.createGain()
    // Apply global volume to the envelope
    gainNode.gain.setValueAtTime(0, now)
    const vol = Math.max(0, Math.min(1, this.volume))
    gainNode.gain.linearRampToValueAtTime(gainMultiplier * velocity * vol, now + attack)
    gainNode.gain.linearRampToValueAtTime(gainMultiplier * velocity * vol * sustain, now + attack + decay)
    gainNode.connect(ctx.destination)

    const osc1 = ctx.createOscillator()
    // Use current timbre for oscillator(s)
    osc1.type = this.timbre
    osc1.frequency.setValueAtTime(freq, now)
    osc1.connect(gainNode)
    osc1.start(now)

    let osc2: OscillatorNode | undefined
    if (detune !== undefined) {
      osc2 = ctx.createOscillator()
      osc2.type = this.timbre
      osc2.frequency.setValueAtTime(freq, now)
      osc2.detune.setValueAtTime(detune, now)
      osc2.connect(gainNode)
      osc2.start(now)
    }

    this.activeNotes.set(note, { oscillator: osc1, oscillator2: osc2, gainNode })
  }

  stopNote(note: string): void {
    const active = this.activeNotes.get(note)
    if (!active || !this.context) return

    const ctx = this.context
    const { release } = this.instrument
    const now = ctx.currentTime

    active.gainNode.gain.cancelScheduledValues(now)
    active.gainNode.gain.setValueAtTime(active.gainNode.gain.value, now)
    active.gainNode.gain.linearRampToValueAtTime(0, now + release)

    const stopTime = now + release + 0.01
    active.oscillator.stop(stopTime)
    active.oscillator2?.stop(stopTime)

    this.activeNotes.delete(note)

    // Clean up gain node after release
    setTimeout(() => {
      active.gainNode.disconnect()
    }, (release + 0.1) * 1000)
  }

  stopAll(): void {
    for (const note of this.activeNotes.keys()) {
      this.stopNote(note)
    }
  }

  dispose(): void {
    this.stopAll()
    this.context?.close()
    this.context = null
  }

  // Volume: 0.0 - 1.0 multiplier for envelope amplitude
  setVolume(volume: number): void {
    const vol = Math.max(0, Math.min(1, volume))
    const oldVolume = this.volume
    this.volume = vol
    if (!this.context || this.context.state !== 'running') return
    // Scale existing active notes' gains to reflect new volume
    if (oldVolume > 0) {
      const ratio = vol / oldVolume
      this.activeNotes.forEach(({ gainNode }) => {
        try {
          gainNode.gain.value = gainNode.gain.value * ratio
        } catch {
          // ignore if node not ready
        }
      })
    }
  }

  // Timbre: sine | triangle | square | sawtooth
  setTimbre(timbre: OscillatorType): void {
    // Clamp to allowed oscillator types
    const allowed: OscillatorType[] = ['sine', 'triangle', 'square', 'sawtooth']
    if (!allowed.includes(timbre)) return
    this.timbre = timbre
    // Existing notes cannot retroactively change timbre; future notes will use new timbre
  }
}
