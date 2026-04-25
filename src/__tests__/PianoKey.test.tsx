import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import PianoKey from '../components/PianoKey'
import type { PianoKeyData } from '../types/piano'

const whiteKeyData: PianoKeyData = {
  note: 'C4',
  isBlack: false,
  octave: 4,
  shortcut: 'q',
}

const blackKeyData: PianoKeyData = {
  note: 'C#4',
  isBlack: true,
  octave: 4,
  shortcut: '2',
}

const defaultProps = {
  isActive: false,
  showNoteLabel: false,
  showShortcutLabel: false,
  onNoteOn: vi.fn(),
  onNoteOff: vi.fn(),
}

describe('PianoKey', () => {
  it('white key has class containing "white"', () => {
    render(<PianoKey {...defaultProps} keyData={whiteKeyData} />)
    const btn = screen.getByRole('button', { name: 'C4' })
    expect(btn.className).toContain('white')
  })

  it('black key has class containing "black"', () => {
    render(<PianoKey {...defaultProps} keyData={blackKeyData} />)
    const btn = screen.getByRole('button', { name: 'C#4' })
    expect(btn.className).toContain('black')
  })

  it('aria-pressed is false when not active', () => {
    render(<PianoKey {...defaultProps} keyData={whiteKeyData} isActive={false} />)
    const btn = screen.getByRole('button', { name: 'C4' })
    expect(btn).toHaveAttribute('aria-pressed', 'false')
  })

  it('aria-pressed is true when active', () => {
    render(<PianoKey {...defaultProps} keyData={whiteKeyData} isActive={true} />)
    const btn = screen.getByRole('button', { name: 'C4' })
    expect(btn).toHaveAttribute('aria-pressed', 'true')
  })

  it('aria-label contains note name', () => {
    render(<PianoKey {...defaultProps} keyData={whiteKeyData} />)
    expect(screen.getByRole('button', { name: 'C4' })).toBeInTheDocument()
  })

  it('shows note label when showNoteLabel=true (white key)', () => {
    render(<PianoKey {...defaultProps} keyData={whiteKeyData} showNoteLabel={true} />)
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('does not show note label when showNoteLabel=false', () => {
    render(<PianoKey {...defaultProps} keyData={whiteKeyData} showNoteLabel={false} />)
    // No span with note name text
    expect(screen.queryByText('C')).not.toBeInTheDocument()
  })

  it('shows shortcut label when showShortcutLabel=true', () => {
    render(<PianoKey {...defaultProps} keyData={whiteKeyData} showShortcutLabel={true} />)
    expect(screen.getByText('q')).toBeInTheDocument()
  })

  it('does not show shortcut label when showShortcutLabel=false', () => {
    render(<PianoKey {...defaultProps} keyData={whiteKeyData} showShortcutLabel={false} />)
    expect(screen.queryByText('q')).not.toBeInTheDocument()
  })

  it('calls onNoteOn on mouseDown', () => {
    const onNoteOn = vi.fn()
    render(<PianoKey {...defaultProps} keyData={whiteKeyData} onNoteOn={onNoteOn} />)
    fireEvent.mouseDown(screen.getByRole('button', { name: 'C4' }))
    expect(onNoteOn).toHaveBeenCalledWith('C4', 100)
  })

  it('calls onNoteOff on mouseUp', () => {
    const onNoteOff = vi.fn()
    render(<PianoKey {...defaultProps} keyData={whiteKeyData} onNoteOff={onNoteOff} />)
    fireEvent.mouseUp(screen.getByRole('button', { name: 'C4' }))
    expect(onNoteOff).toHaveBeenCalledWith('C4')
  })

  it('calls onNoteOff on mouseLeave when active', () => {
    const onNoteOff = vi.fn()
    render(<PianoKey {...defaultProps} keyData={whiteKeyData} isActive={true} onNoteOff={onNoteOff} />)
    fireEvent.mouseLeave(screen.getByRole('button', { name: 'C4' }))
    expect(onNoteOff).toHaveBeenCalledWith('C4')
  })

  it('does NOT call onNoteOff on mouseLeave when inactive', () => {
    const onNoteOff = vi.fn()
    render(<PianoKey {...defaultProps} keyData={whiteKeyData} isActive={false} onNoteOff={onNoteOff} />)
    fireEvent.mouseLeave(screen.getByRole('button', { name: 'C4' }))
    expect(onNoteOff).not.toHaveBeenCalled()
  })

  it('active key has active class', () => {
    render(<PianoKey {...defaultProps} keyData={whiteKeyData} isActive={true} />)
    const btn = screen.getByRole('button', { name: 'C4' })
    expect(btn.className).toContain('active')
  })

  it('black key does not show note label even with showNoteLabel=true', () => {
    render(<PianoKey {...defaultProps} keyData={blackKeyData} showNoteLabel={true} />)
    // black keys don't show note labels per the component logic
    expect(screen.queryByText('C#')).not.toBeInTheDocument()
  })
})
