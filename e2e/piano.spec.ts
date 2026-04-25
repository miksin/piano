import { test, expect } from '@playwright/test'

test('page loads and shows Piano title', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Piano/i })).toBeVisible()
})

test('keyboard renders with white keys', async ({ page }) => {
  await page.goto('/')
  // App renders 2 octaves = 14 white keys (C D E F G A B × 2)
  const whiteKeys = page.locator('.piano-key--white')
  await expect(whiteKeys).toHaveCount(14)
})

test('octave prev/next buttons exist', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('button', { hasText: '◀' })).toBeVisible()
  await expect(page.locator('button', { hasText: '▶' })).toBeVisible()
})

test('clicking next octave updates range label', async ({ page }) => {
  await page.goto('/')
  // Initial label: C3 – B4; after clicking ▶ it becomes C4 – B5
  const nextBtn = page.locator('button', { hasText: '▶' })
  await nextBtn.click()
  await expect(page.locator('.piano-octave-label')).toContainText('C4')
})

test('pressing keyboard key activates a piano key', async ({ page }) => {
  await page.goto('/')
  // Click page body to ensure keyboard events are captured
  await page.locator('body').click()
  // Hold 'z' down — maps to C3
  await page.keyboard.down('z')
  const activeKeys = page.locator('.piano-key[aria-pressed="true"]')
  await expect(activeKeys).toHaveCount(1)
  await page.keyboard.up('z')
})
