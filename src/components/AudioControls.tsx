import React, { useMemo } from 'react'
import { useAudioEngine } from '../hooks/useAudioEngine'
import './AudioControls.css'

// Timbre options align with Web Audio OscillatorType: 'sine' | 'triangle' | 'square' | 'sawtooth'
type Timbre = 'sine' | 'triangle' | 'square' | 'sawtooth' | string

export default function AudioControls(): React.JSX.Element {
  const { setVolume, setTimbre } = useAudioEngine()
  // Local UI state mirrors engine state for a responsive UI vibe
  const timbres: Timbre[] = useMemo(() => ['sine', 'triangle', 'square', 'sawtooth'], [])

  // Handlers
  const onVolumeChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const v = parseFloat(e.target.value)
    setVolume(v)
  }

  const onTimbreChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const t = e.target.value as OscillatorType
    setTimbre(t)
  }

  // Simple controlled defaults (these will be overridden by engine, but provide sensible initial values)
  return (
    <div className="audio-controls">
      <div className="audio-controls__group">
        <label className="audio-controls__label" htmlFor="volume">Volume</label>
        <input
          id="volume"
          className="audio-controls__slider"
          type="range"
          min={0}
          max={1}
          step={0.01}
          defaultValue={1}
          onChange={onVolumeChange}
        />
      </div>
      <div className="audio-controls__group">
        <label className="audio-controls__label" htmlFor="timbre">Timbre</label>
        <select id="timbre" className="audio-controls__select" onChange={onTimbreChange} defaultValue={'triangle'}>
          {timbres.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
