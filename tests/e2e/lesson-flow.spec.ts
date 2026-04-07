import { test, expect } from '@playwright/test'

test('completes first-repo lesson steps', async ({ page }) => {
  await page.goto('/lessons/first-repo')
  await page.waitForSelector('.xterm', { timeout: 10000 })
  await page.locator('.xterm').click({ force: true })
  await page.keyboard.type('git init')
  await page.keyboard.press('Enter')
  await expect(page.locator('text=✅')).toBeVisible({ timeout: 5000 })
})
