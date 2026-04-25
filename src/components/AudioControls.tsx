import React, { useMemo } from 'react'
import './AudioControls.css'

// Props-driven AudioControls: controlled by App via shared AudioEngine state
type Timbre = 'sine' | 'triangle' | 'square' | 'sawtooth' | string
type AudioControlsProps = {
  volume: number
  onVolumeChange: (v: number) => void
  timbre: OscillatorType
  onTimbreChange: (t: OscillatorType) => void
}

// Timbre options align with Web Audio OscillatorType: 'sine' | 'triangle' | 'square' | 'sawtooth'

export default function AudioControls({ volume, onVolumeChange, timbre, onTimbreChange }: AudioControlsProps): React.JSX.Element {
  // Timbre options align with Web Audio OscillatorType: 'sine' | 'triangle' | 'square' | 'sawtooth'
  const timbres: Timbre[] = useMemo(() => ['sine', 'triangle', 'square', 'sawtooth'], [])
  // Handlers
  const handleVolumeChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const v = parseFloat(e.target.value)
    onVolumeChange(v)
  }

  const handleTimbreChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const t = e.target.value as OscillatorType
    onTimbreChange(t)
  }

	// Simple controlled inputs bound to props
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
              value={volume}
              onChange={handleVolumeChange}
            />
		  </div>
		  <div className="audio-controls__group">
			<label className="audio-controls__label" htmlFor="timbre">Timbre</label>
            <select id="timbre" className="audio-controls__select" value={timbre} onChange={handleTimbreChange}>
			  {timbres.map((t) => (
				<option key={t} value={t}>{t}</option>
			  ))}
			</select>
		  </div>
		</div>
	)
}
