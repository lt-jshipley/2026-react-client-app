import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can login successfully', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[name="email"]', 'wrong@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('[role="alert"]')).toContainText(
      'Invalid credentials'
    )
    await expect(page).toHaveURL('/login')
  })

  test('login form is accessible', async ({ page }) => {
    await page.goto('/login')

    // Check for proper labeling
    const emailInput = page.getByLabel(/email/i)
    const passwordInput = page.getByLabel(/password/i)

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()

    // Check focus management
    await emailInput.focus()
    await expect(emailInput).toBeFocused()
  })
})
