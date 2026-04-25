import React from 'react'
import { render, screen } from '@testing-library/react'
import { test, expect } from 'vitest'
import '@testing-library/jest-dom'
import App from '../App'

test('App mounts and displays title', () => {
  render(<App />)
  // Ensure the main heading exists
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Piano/i)
})
