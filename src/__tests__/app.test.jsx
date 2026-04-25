import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '../App'

test('App mounts and displays title', () => {
  render(<App />)
  expect(screen.getByText(/Piano/i)).toBeInTheDocument()
})
