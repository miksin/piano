export interface InstrumentConfig {
  oscillatorType: OscillatorType
  attack: number
  decay: number
  sustain: number
  release: number
  gainMultiplier: number
  /** Optional second oscillator for richer tone */
  detune?: number
}

/** Piano-like tone using triangle + slight detuned sine */
export const pianoInstrument: InstrumentConfig = {
  oscillatorType: 'triangle',
  attack: 0.01,
  decay: 0.1,
  sustain: 0.7,
  release: 0.3,
  gainMultiplier: 0.5,
  detune: 3,
}

export default pianoInstrument
