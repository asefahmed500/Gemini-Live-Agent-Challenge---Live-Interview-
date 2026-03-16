import { test, expect } from '@playwright/test';

test.describe('No Auth Required - Public Access', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should allow direct access to dashboard without login', async ({ page }) => {
    // Should NOT redirect to login - auth is removed
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    // Should show guest user
    await expect(page.locator('text=Guest')).toBeVisible();
    await expect(page.locator('text=guest@liveinterview.local')).toBeVisible();
  });

  test('should allow direct access to interview page without login', async ({ page }) => {
    // Should NOT redirect to login - auth is removed
    await page.goto('/interview');
    await expect(page).toHaveURL(/\/interview/);

    // Should show interview setup
    await expect(page.locator('text=Interview Setup')).toBeVisible();
  });

  test('should show guest user in navbar', async ({ page }) => {
    // Check navbar shows guest user
    await page.goto('/');
    await expect(page.locator('text=Guest')).toBeVisible();
    await expect(page.locator('text=guest@liveinterview.local')).toBeVisible();
  });

  test('should have working navigation links without auth', async ({ page }) => {
    // Interview link should be visible
    await expect(page.locator('a[href="/interview"]')).toBeVisible();

    // Dashboard link should be visible
    await expect(page.locator('a[href="/dashboard"]')).toBeVisible();
  });

  test('should NOT show sign in/sign up buttons', async ({ page }) => {
    // These buttons should NOT be visible since auth is removed
    const signInButton = page.locator('a[href="/login"]');
    await expect(signInButton).not.toBeVisible();

    const signUpButton = page.locator('a[href="/register"]');
    await expect(signUpButton).not.toBeVisible();
  });

  test('should NOT show sign out button', async ({ page }) => {
    // Sign out button should NOT exist since auth is removed
    const signOutButton = page.locator('button[title="Sign out"]');
    await expect(signOutButton).not.toBeVisible();
  });

  test('should display dashboard stats for guest user', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show dashboard title
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Welcome back, Guest')).toBeVisible();

    // Should show stats cards
    await expect(page.locator('text=Total Interviews')).toBeVisible();
    await expect(page.locator('text=Completed')).toBeVisible();
    await expect(page.locator('text=Average Score')).toBeVisible();
    await expect(page.locator('text=Grade')).toBeVisible();
  });

  test('should allow starting interview from dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Click "New Interview" button
    await page.click('a:has-text("New Interview")');

    // Should navigate to interview page
    await expect(page).toHaveURL(/\/interview/);
  });

  test('should navigate between pages without auth redirect', async ({ page }) => {
    // Go to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    // Go to interview
    await page.goto('/interview');
    await expect(page).toHaveURL(/\/interview/);

    // Go back to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    // No redirects should happen
  });

  test('should show interview setup page correctly', async ({ page }) => {
    await page.goto('/interview');

    // Check for interview setup elements
    await expect(page.locator('text=Target Job Role')).toBeVisible();
    await expect(page.locator('text=Difficulty')).toBeVisible();

    // Check for difficulty buttons
    await expect(page.locator('button:has-text("Easy")')).toBeVisible();
    await expect(page.locator('button:has-text("Medium")')).toBeVisible();
    await expect(page.locator('button:has-text("Hard")')).toBeVisible();
  });
});
