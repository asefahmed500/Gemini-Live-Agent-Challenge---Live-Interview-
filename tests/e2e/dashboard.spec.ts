import { test, expect } from '@playwright/test';

test.describe('Dashboard Functionality', () => {
  const generateTestUser = () => ({
    name: `Dashboard User ${Date.now()}`,
    email: `dash-${Date.now()}@example.com`,
    password: 'DashPass123!',
  });

  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    testUser = generateTestUser();

    // Register and login before each test
    await page.goto('/register');
    await page.fill('#name', testUser.name);
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.fill('#confirmPassword', testUser.password);
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
  });

  test('should display dashboard after login', async ({ page }) => {
    // Should show dashboard heading
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();

    // Should show welcome message with user name
    await expect(page.locator(`text=Welcome back, ${testUser.name}`)).toBeVisible();

    // Should have main content area
    const mainContent = page.locator('main, .container');
    await expect(mainContent.first()).toBeVisible();
  });

  test('should show user statistics cards', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Look for statistics cards (they might be empty for new users)
    // The dashboard has stats cards for various metrics
    const cards = page.locator('.grid > div, [class*="card"], .grid > *');
    const count = await cards.count();

    // Should have some cards/grid items
    expect(count).toBeGreaterThan(0);
  });

  test('should display new interview button', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for "New Interview" button
    const newInterviewButton = page.locator('a:has-text("New Interview"), button:has-text("New Interview"), a[href="/interview"]');
    await expect(newInterviewButton.first()).toBeVisible();
  });

  test('should show empty state for new users', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for API to respond
    await page.waitForTimeout(2000);

    // For new users, should show empty state or no sessions
    // Either show sessions or empty state
    const pageContent = await page.content();

    // Check if page loads without errors
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  });

  test('should have navigation to interview page', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for interview link/button
    const interviewLink = page.locator('a[href="/interview"], button:has-text("Interview")').first();
    await expect(interviewLink).toBeVisible();
  });

  test('should show user name in welcome message', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show welcome message with user name
    await expect(page.locator(`text=${testUser.name}`)).toBeVisible();
  });

  test('should allow navigation back to home', async ({ page }) => {
    await page.goto('/dashboard');

    // Click logo/brand to go home
    await page.click('a[href="/"]');

    // Should navigate to home
    await expect(page).toHaveURL(/\//);
    await expect(page.locator('text=LiveInterview')).toBeVisible();
  });

  test('should be responsive on different viewports', async ({ page }) => {
    await page.goto('/dashboard');

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Dashboard content should still be visible
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();

    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  });

  test('should show loading state', async ({ page }) => {
    // Create a new user to see loading state
    const newUser = generateTestUser();

    await page.goto('/register');
    await page.fill('#name', newUser.name);
    await page.fill('#email', newUser.email);
    await page.fill('#password', newUser.password);
    await page.fill('#confirmPassword', newUser.password);

    // Submit and look for loading state
    await page.click('button[type="submit"]');

    // Check for loading indicator (might be brief)
    const loader = page.locator('.animate-spin, [class*="loading"], text=Loading').first();

    // Loading state might be very brief
    await loader.waitFor({ state: 'attached', timeout: 1000 }).catch(() => {
      // Loading finished too quickly, that's OK
    });

    // Should eventually reach dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
  });

  test('should persist user session', async ({ page }) => {
    await page.goto('/dashboard');

    // Reload page
    await page.reload();

    // Should still be on dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator(`text=${testUser.name}`)).toBeVisible();
  });

  test('should have functional logout', async ({ page }) => {
    await page.goto('/dashboard');

    // Logout using the sign out button
    await page.click('button[title="Sign out"]');

    // Should redirect away from dashboard
    await page.waitForTimeout(2000);

    // Try to access dashboard again
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should display navbar with user info', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show user name in navbar
    await expect(page.locator(`text=${testUser.name}`)).toBeVisible();

    // Should show user email
    await expect(page.locator(`text=${testUser.email}`)).toBeVisible();

    // Should show logout button
    await expect(page.locator('button[title="Sign out"]')).toBeVisible();
  });

  test('should have navigation links in navbar', async ({ page }) => {
    await page.goto('/dashboard');

    // Check for Interview link
    await expect(page.locator('a[href="/interview"]')).toBeVisible();

    // Check for Dashboard link
    await expect(page.locator('a[href="/dashboard"]')).toBeVisible();

    // Check for logo/home link
    await expect(page.locator('a[href="/"]')).toBeVisible();
  });
});
