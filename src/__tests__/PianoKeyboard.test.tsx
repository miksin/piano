import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import PianoKeyboard from '../components/PianoKeyboard'

describe('PianoKeyboard', () => {
  it('renders 14 white keys for 2-octave view', () => {
    render(<PianoKeyboard baseOctave={3} octaves={2} />)
    // White keys: C D E F G A B = 7 per octave × 2 = 14
    const allButtons = screen.getAllByRole('button')
    // Filter out octave control buttons (◀ and ▶) — there are 2 of them
    const pianoKeys = allButtons.filter(btn =>
      btn.classList.contains('piano-key--white') || btn.classList.contains('piano-key--black')
    )
    const whiteKeys = pianoKeys.filter(btn => btn.classList.contains('piano-key--white'))
    expect(whiteKeys).toHaveLength(14)
  })

  it('renders 10 black keys for 2-octave view', () => {
    render(<PianoKeyboard baseOctave={3} octaves={2} />)
    const allButtons = screen.getAllByRole('button')
    const blackKeys = allButtons.filter(btn => btn.classList.contains('piano-key--black'))
    // Black keys: C# D# F# G# A# = 5 per octave × 2 = 10
    expect(blackKeys).toHaveLength(10)
  })

  it('renders prev (◀) and next (▶) octave buttons', () => {
    render(<PianoKeyboard baseOctave={3} octaves={2} />)
    expect(screen.getByText('◀')).toBeInTheDocument()
    expect(screen.getByText('▶')).toBeInTheDocument()
  })

  it('displays initial range label C3 – B4', () => {
    render(<PianoKeyboard baseOctave={3} octaves={2} />)
    expect(screen.getByText('C3 – B4')).toBeInTheDocument()
  })

  it('Next octave button updates range label', () => {
    render(<PianoKeyboard baseOctave={3} octaves={2} />)
    fireEvent.click(screen.getByText('▶'))
    expect(screen.getByText('C4 – B5')).toBeInTheDocument()
  })

  it('Prev octave button updates range label', () => {
    render(<PianoKeyboard baseOctave={3} octaves={2} />)
    fireEvent.click(screen.getByText('◀'))
    expect(screen.getByText('C2 – B3')).toBeInTheDocument()
  })

  it('clicking a white key calls onNoteOn callback', () => {
    const onNoteOn = vi.fn()
    render(<PianoKeyboard baseOctave={3} octaves={2} onNoteOn={onNoteOn} />)
    const whiteKey = screen.getByRole('button', { name: 'C3' })
    fireEvent.mouseDown(whiteKey)
    expect(onNoteOn).toHaveBeenCalledWith('C3', 100)
  })

  it('mouseup on a white key calls onNoteOff callback', () => {
    const onNoteOff = vi.fn()
    render(<PianoKeyboard baseOctave={3} octaves={2} onNoteOff={onNoteOff} />)
    const whiteKey = screen.getByRole('button', { name: 'C3' })
    fireEvent.mouseDown(whiteKey)
    fireEvent.mouseUp(whiteKey)
    expect(onNoteOff).toHaveBeenCalledWith('C3')
  })

  it('clicking a black key calls onNoteOn callback', () => {
    const onNoteOn = vi.fn()
    render(<PianoKeyboard baseOctave={3} octaves={2} onNoteOn={onNoteOn} />)
    const blackKey = screen.getByRole('button', { name: 'C#3' })
    fireEvent.mouseDown(blackKey)
    expect(onNoteOn).toHaveBeenCalledWith('C#3', 100)
  })
})
