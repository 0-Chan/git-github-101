import { test, expect } from '@playwright/test'

test('terminal accepts input and shows output', async ({ page }) => {
  await page.goto('/lessons/first-repo')
  await page.waitForSelector('.xterm', { timeout: 10000 })
  await page.locator('.xterm').click({ force: true })
  await page.keyboard.type('도움말')
  await page.keyboard.press('Enter')
  await expect(page.locator('.xterm')).toContainText('Git', { timeout: 5000 })
})
