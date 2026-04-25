// Minimal Tone.js mock for Vitest environment
// Exposes Sampler and Destination to satisfy tests that import from 'tone'

export class Sampler {
  constructor() {
    // expose volume API surface that tests may interact with
    this.volume = { value: 0 }
  }

  toDestination() {
    // mimic Tone.js connection API
    return this
  }

  triggerAttack() {
    // no-op mock
  }

  triggerRelease() {
    // no-op mock
  }

  disconnect() {
    // no-op mock
  }
}

export const Destination = {}

// Provide a mock for Tone.start used to unlock AudioContext in tests
export const start = vi.fn().mockResolvedValue(undefined)

// Optional default export for compatibility with code that imports Tone.js as a default namespace
export default {
  Sampler,
  Destination,
  start
}
