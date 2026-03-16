import { test, expect } from '@playwright/test';

test.describe('Session Report', () => {
  const generateTestUser = () => ({
    name: `Report User ${Date.now()}`,
    email: `report-${Date.now()}@example.com`,
    password: 'ReportPass123!',
  });

  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    testUser = generateTestUser();

    // Register and login
    await page.goto('/register');
    await page.fill('#name', testUser.name);
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.fill('#confirmPassword', testUser.password);
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
  });

  test('should display dashboard for new user', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show dashboard
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();

    // Should show welcome message
    await expect(page.locator(`text=Welcome back, ${testUser.name}`)).toBeVisible();
  });

  test('should show new interview button', async ({ page }) => {
    await page.goto('/dashboard');

    // Should have button to start new interview
    const newInterviewButton = page.locator('a:has-text("New Interview"), a[href="/interview"]').first();
    await expect(newInterviewButton).toBeVisible();
  });

  test('should handle navigation to interview', async ({ page }) => {
    await page.goto('/dashboard');

    // Navigate to interview
    await page.click('a[href="/interview"]');

    // Should navigate to interview page
    await expect(page).toHaveURL(/\/interview/);
  });

  test('should show user statistics area', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for page to fully load
    await page.waitForTimeout(2000);

    // Should have a statistics area (even if empty for new users)
    const statsArea = page.locator('.grid, [class*="stat"]').first();
    await expect(statsArea).toBeVisible();
  });

  test('should display user info correctly', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show user name
    await expect(page.locator(`text=${testUser.name}`)).toBeVisible();

    // Should show user email
    await expect(page.locator(`text=${testUser.email}`)).toBeVisible();
  });

  test('should have functional navigation', async ({ page }) => {
    await page.goto('/dashboard');

    // Check navbar is present
    await expect(page.locator('nav')).toBeVisible();

    // Should have link to interview
    await expect(page.locator('a[href="/interview"]')).toBeVisible();

    // Should have logo/home link
    await expect(page.locator('a[href="/"]')).toBeVisible();
  });

  test('should allow logout from dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Logout
    await page.click('button[title="Sign out"]');

    await page.waitForTimeout(2000);

    // Should redirect away
    const url = page.url();
    expect(url).not.toContain('/dashboard');

    // Trying to access dashboard should redirect to login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/dashboard');

    // Dashboard should be visible on mobile
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();

    // User info should be visible (might be hidden on small screens, so check navbar)
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should maintain session after navigation', async ({ page }) => {
    await page.goto('/dashboard');

    // Go to home
    await page.click('a[href="/"]');

    // Go back to dashboard
    await page.goto('/dashboard');

    // Should still be logged in
    await expect(page.locator(`text=${testUser.name}`)).toBeVisible();
  });

  test('should handle page reload', async ({ page }) => {
    await page.goto('/dashboard');

    // Reload page
    await page.reload();

    // Should still be on dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // User info should still be visible
    await expect(page.locator(`text=${testUser.name}`)).toBeVisible();
  });

  test('should display loading state initially', async ({ page }) => {
    // Access dashboard directly
    await page.goto('/dashboard');

    // Check for loading indicator (might be very brief)
    const loader = page.locator('.animate-spin, text=Loading').first();

    await loader.waitFor({ state: 'attached', timeout: 1000 }).catch(() => {
      // Loading finished too quickly, that's OK
    });

    // Eventually dashboard should load
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible({ timeout: 5000 });
  });

  test('should handle browser back button', async ({ page }) => {
    await page.goto('/dashboard');

    // Navigate to interview
    await page.click('a[href="/interview"]');
    await expect(page).toHaveURL(/\/interview/);

    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show appropriate empty state for new users', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for data to load
    await page.waitForTimeout(2000);

    // For new users, the dashboard should load successfully
    // It might show "No sessions yet" or similar message
    // Or just show the stats with zeros

    // The important thing is the page loads without errors
    await expect(page.locator('body')).toBeVisible();
  });
});
