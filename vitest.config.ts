import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
  resolve: {
    alias: {
      // Mock Tone.js module to avoid ESM resolution issues in Vitest
      'tone': path.resolve(process.cwd(), 'src/__mocks__/tone.ts')
    }
  },
})
