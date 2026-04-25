import { describe, it, expect, vi, beforeEach } from 'vitest'
import { noteToFrequency, AudioEngine } from '../audio/audioEngine'

// Mock AudioContext globally
function createMockAudioContext() {
  const mockOscillator = {
    type: 'sine' as OscillatorType,
    frequency: { setValueAtTime: vi.fn() },
    detune: { setValueAtTime: vi.fn() },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }

  const mockGain = {
    gain: {
      value: 0.5,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      cancelScheduledValues: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }

  return {
    state: 'running',
    currentTime: 0,
    createGain: vi.fn(() => mockGain),
    createOscillator: vi.fn(() => ({ ...mockOscillator })),
    destination: {},
    resume: vi.fn(),
    close: vi.fn(),
    _mockGain: mockGain,
    _mockOscillator: mockOscillator,
  }
}

describe('noteToFrequency', () => {
  it('converts A4 to 440 Hz', () => {
    expect(noteToFrequency('A4')).toBe(440)
  })

  it('converts C4 to approximately 261.63 Hz', () => {
    expect(noteToFrequency('C4')).toBeCloseTo(261.63, 1)
  })

  it('C#4 is higher than C4', () => {
    expect(noteToFrequency('C#4')).toBeGreaterThan(noteToFrequency('C4'))
  })

  it('converts Bb3 correctly (enharmonic with A#3)', () => {
    expect(noteToFrequency('Bb3')).toBeCloseTo(noteToFrequency('A#3'), 5)
  })

  it('throws on invalid note format', () => {
    expect(() => noteToFrequency('X4')).toThrow()
  })

  it('throws on empty string', () => {
    expect(() => noteToFrequency('')).toThrow()
  })

  it('handles octave boundaries correctly: B3 < C4', () => {
    expect(noteToFrequency('B3')).toBeLessThan(noteToFrequency('C4'))
  })
})

describe('AudioEngine', () => {
  let mockCtx: ReturnType<typeof createMockAudioContext>

  beforeEach(() => {
    mockCtx = createMockAudioContext()
    // @ts-ignore
    global.AudioContext = vi.fn(() => mockCtx)
  })

  it('is not ready before initialization', () => {
    const engine = new AudioEngine()
    expect(engine.isReady).toBe(false)
  })

  it('is ready after initialization with running context', async () => {
    const engine = new AudioEngine()
    await engine.initialize()
    expect(engine.isReady).toBe(true)
  })

  it('resumes suspended context on initialize', async () => {
    mockCtx.state = 'suspended' as any
    // @ts-ignore
    global.AudioContext = vi.fn(() => ({ ...mockCtx, state: 'suspended', resume: vi.fn(async () => { mockCtx.state = 'running' as any }) }))
    const engine = new AudioEngine()
    await engine.initialize()
    // resume was called
    const ctx = (global.AudioContext as any).mock.results[0].value
    expect(ctx.resume).toHaveBeenCalled()
  })

  it('playNote creates oscillator and gain node', async () => {
    const engine = new AudioEngine()
    await engine.initialize()
    engine.playNote('A4')
    expect(mockCtx.createOscillator).toHaveBeenCalled()
    expect(mockCtx.createGain).toHaveBeenCalled()
  })

  it('playNote does nothing if context is not ready', () => {
    const engine = new AudioEngine()
    // Not initialized
    engine.playNote('A4')
    expect(mockCtx.createOscillator).not.toHaveBeenCalled()
  })

  it('stopNote triggers release envelope on gain', async () => {
    const engine = new AudioEngine()
    await engine.initialize()
    engine.playNote('C4')
    engine.stopNote('C4')
    expect(mockCtx._mockGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, expect.any(Number))
  })

  it('stopNote on non-existing note does nothing', async () => {
    const engine = new AudioEngine()
    await engine.initialize()
    // Should not throw
    expect(() => engine.stopNote('Z9')).not.toThrow()
  })

  it('stopAll clears all active notes', async () => {
    const engine = new AudioEngine()
    await engine.initialize()
    engine.playNote('C4')
    engine.playNote('E4')
    engine.playNote('G4')
    engine.stopAll()
    // After stopAll, calling stopAll again should be a no-op (all notes gone)
    const callCountBefore = mockCtx._mockGain.gain.linearRampToValueAtTime.mock.calls.length
    engine.stopAll()
    const callCountAfter = mockCtx._mockGain.gain.linearRampToValueAtTime.mock.calls.length
    expect(callCountAfter).toBe(callCountBefore)
  })

  it('playing same note twice stops the previous one first', async () => {
    const engine = new AudioEngine()
    await engine.initialize()
    engine.playNote('A4')
    const gainCallsBefore = mockCtx._mockGain.gain.linearRampToValueAtTime.mock.calls.length
    engine.playNote('A4') // should stop old, play new
    // linearRampToValueAtTime called at least once for the stop envelope
    expect(mockCtx._mockGain.gain.linearRampToValueAtTime.mock.calls.length).toBeGreaterThan(gainCallsBefore)
  })

  it('dispose calls context.close()', async () => {
    const engine = new AudioEngine()
    await engine.initialize()
    engine.dispose()
    expect(mockCtx.close).toHaveBeenCalled()
  })
})
