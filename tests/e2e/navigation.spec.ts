import { expect, test } from "@playwright/test";

test("landing page shows lesson list", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("text=Git이란?")).toBeVisible();
  await expect(page.locator("text=첫 번째 저장소").first()).toBeVisible();
});

test("navigates to lesson page", async ({ page }) => {
  await page.goto("/");
  await page.click("text=첫 번째 저장소");
  await expect(page).toHaveURL("/lessons/first-repo");
});

test("dark mode toggle works", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  await page.click('[aria-label="Toggle theme"]');
  await expect(html).toHaveClass(/dark/);
});
