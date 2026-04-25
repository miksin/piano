import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboard } from '../hooks/useKeyboard'

function fireKeyDown(key: string, repeat = false) {
  const event = new KeyboardEvent('keydown', { key, repeat, bubbles: true })
  window.dispatchEvent(event)
}

function fireKeyUp(key: string) {
  const event = new KeyboardEvent('keyup', { key, bubbles: true })
  window.dispatchEvent(event)
}

describe('useKeyboard', () => {
  let onNoteOn: ReturnType<typeof vi.fn>
  let onNoteOff: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onNoteOn = vi.fn()
    onNoteOff = vi.fn()
  })

  it('key "z" triggers noteOn for C3', () => {
    renderHook(() => useKeyboard(onNoteOn, onNoteOff))
    act(() => fireKeyDown('z'))
    expect(onNoteOn).toHaveBeenCalledWith('C3', 100)
  })

  it('key "s" triggers noteOn for C#3', () => {
    renderHook(() => useKeyboard(onNoteOn, onNoteOff))
    act(() => fireKeyDown('s'))
    expect(onNoteOn).toHaveBeenCalledWith('C#3', 100)
  })

  it('keyup triggers noteOff', () => {
    renderHook(() => useKeyboard(onNoteOn, onNoteOff))
    act(() => {
      fireKeyDown('z')
      fireKeyUp('z')
    })
    expect(onNoteOff).toHaveBeenCalledWith('C3')
  })

  it('holding key (repeat=true) does not re-trigger noteOn', () => {
    renderHook(() => useKeyboard(onNoteOn, onNoteOff))
    act(() => {
      fireKeyDown('z')
      fireKeyDown('z', true) // repeat
      fireKeyDown('z', true) // repeat again
    })
    expect(onNoteOn).toHaveBeenCalledTimes(1)
  })

  it('unrecognized keys do not trigger callbacks', () => {
    renderHook(() => useKeyboard(onNoteOn, onNoteOff))
    act(() => {
      fireKeyDown('F1')
      fireKeyUp('F1')
    })
    expect(onNoteOn).not.toHaveBeenCalled()
    expect(onNoteOff).not.toHaveBeenCalled()
  })

  it('uppercase keys are handled (case-insensitive)', () => {
    renderHook(() => useKeyboard(onNoteOn, onNoteOff))
    act(() => fireKeyDown('Z')) // uppercase Z
    expect(onNoteOn).toHaveBeenCalledWith('C3', 100)
  })

  it('q key triggers C4', () => {
    renderHook(() => useKeyboard(onNoteOn, onNoteOff))
    act(() => fireKeyDown('q'))
    expect(onNoteOn).toHaveBeenCalledWith('C4', 100)
  })

  it('listeners are removed on unmount', () => {
    const { unmount } = renderHook(() => useKeyboard(onNoteOn, onNoteOff))
    unmount()
    act(() => fireKeyDown('z'))
    expect(onNoteOn).not.toHaveBeenCalled()
  })
})
