import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

const root = document.getElementById('root')
// Basic mount for environments where document might not exist during tests
if (root) {
  createRoot(root).render(<App />)
}
