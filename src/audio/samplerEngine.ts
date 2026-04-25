import * as Tone from 'tone'

// Sampler-based audio engine using Tone.js with real piano samples
// Samples loaded from: https://gleitz.github.io/midi-js-soundfonts/MusyngKite/acoustic_grand_piano-mp3/

type NoteName = string

export class SamplerEngine {
  private sampler: Tone.Sampler | null = null
  private _ready: boolean = false
  private _readyPromise: Promise<void> | null = null
  private _resolveReady?: () => void

  constructor() {
    // Nothing to do here; lazy initialize in initialize()
  }

  get isReady(): boolean {
    return this._ready
  }

  // Initialize Tone context and preload samples
  async initialize(): Promise<void> {
    // Unlock AudioContext as early as possible to satisfy autoplay policies
    await Tone.start()
    if (!this.sampler) {
      // Build sample map for all required notes
      // gleitz CDN uses flat (b) notation, not sharp (#)
      // Map: Tone.js note name → actual filename on CDN
      const sampleMap: Record<string, string> = {
        'A0': 'A0', 'C1': 'C1', 'D#1': 'Eb1', 'F#1': 'Gb1',
        'A1': 'A1', 'C2': 'C2', 'D#2': 'Eb2', 'F#2': 'Gb2',
        'A2': 'A2', 'C3': 'C3', 'D#3': 'Eb3', 'F#3': 'Gb3',
        'A3': 'A3', 'C4': 'C4', 'D#4': 'Eb4', 'F#4': 'Gb4',
        'A4': 'A4', 'C5': 'C5', 'D#5': 'Eb5', 'F#5': 'Gb5',
        'A5': 'A5', 'C6': 'C6', 'D#6': 'Eb6', 'F#6': 'Gb6',
        'A6': 'A6', 'C7': 'C7', 'D#7': 'Eb7', 'F#7': 'Gb7',
        'A7': 'A7', 'C8': 'C8',
      }
      const baseUrl = 'https://gleitz.github.io/midi-js-soundfonts/MusyngKite/acoustic_grand_piano-mp3/'
      const samples: Record<string, string> = {}
      for (const [note, filename] of Object.entries(sampleMap)) {
        samples[note] = `${filename}.mp3`
      }

      // Create the sampler with onload callback
      this.sampler = new Tone.Sampler(samples, () => {
        this._ready = true
        this._resolveReady?.()
      }, baseUrl)
      // Route to destination
      this.sampler.toDestination()
    }

    // Ensure AudioContext is running
    if (Tone.context.state === 'suspended') {
      await Tone.context.resume()
    }

    if (!this._readyPromise) {
      this._readyPromise = new Promise<void>((resolve) => {
        this._resolveReady = resolve
      })
    }
    await this._readyPromise
  }

  // Play a note using the sampler
  playNote(note: NoteName, velocity: number = 1): void {
    if (!this.sampler) return
    // Trigger the sample; Tone.Sampler supports velocity via velocity parameter in triggerAttack
    // If not available, fall back to triggerAttack with default duration
    try {
      // Some Tone versions require time arg; use now() for immediate playback
      // @ts-ignore - type may differ across Tone versions
      this.sampler.triggerAttack(note, Tone.now(), velocity)
    } catch {
      try {
        // Fallback API
        // @ts-ignore
        this.sampler.triggerAttack(note, 0, velocity)
      } catch {
        // Last resort: triggerAttack with just note
        // @ts-ignore
        this.sampler.triggerAttack(note)
      }
    }
  }

  stopNote(note: NoteName): void {
    if (!this.sampler) return
    // Stop the sample
    try {
      // @ts-ignore - method exists on Tone.Sampler
      this.sampler.triggerRelease(note)
    } catch {
      // Some versions may not support explicit release; ignore
    }
  }

  setVolume(volume: number): void {
    // Map 0..1 to -40dB .. 0dB
    const v = Math.max(0, Math.min(1, volume))
    const db = -40 + v * 40
    if (this.sampler) {
      // Tone.Sampler exposes a 'volume' property (a GainNode) with .value in dB
      // @ts-ignore
      this.sampler.volume.value = db
    }
  }

  setTimbre(_timbre: OscillatorType): void {
    // No-op for sampler
  }

  dispose(): void {
    this.sampler?.dispose()
    this.sampler = null
    this._ready = false
    this._readyPromise = null
    this._resolveReady = undefined
  }
}

export default SamplerEngine
