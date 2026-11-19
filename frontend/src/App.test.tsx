import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import App from './App'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

it('renders the application entry point', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
  render(<App />)
  expect(screen.getByRole('heading', { name: 'SystemPulse' })).toBeTruthy()
  expect(await screen.findByText('Disconnected')).toBeTruthy()
  expect(await screen.findAllByText('Waiting for measurements')).toHaveLength(2)
})
