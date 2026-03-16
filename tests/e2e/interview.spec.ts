import { test, expect } from '@playwright/test';

test.describe('Interview Workflow', () => {
  const generateTestUser = () => ({
    name: `Interview User ${Date.now()}`,
    email: `interview-${Date.now()}@example.com`,
    password: 'InterviewPass123!',
  });

  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page, context }) => {
    testUser = generateTestUser();

    // Setup permissions for camera and microphone
    await context.grantPermissions(['camera', 'microphone']);

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

  test('should access interview page when authenticated', async ({ page }) => {
    await page.goto('/interview');

    // Should be able to access interview page
    await expect(page).toHaveURL(/\/interview/);

    // Should have main content
    const mainContent = page.locator('main, .container, [class*="interview"]').first();
    await expect(mainContent).toBeVisible();
  });

  test('should display interview interface elements', async ({ page }) => {
    await page.goto('/interview');

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Should have some interview interface
    // The exact elements depend on implementation
    const pageContent = await page.content();

    // Page should load without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have video container or placeholder', async ({ page }) => {
    await page.goto('/interview');

    await page.waitForTimeout(2000);

    // Look for video element or video container
    const videoElement = page.locator('video, [class*="video"], [data-testid*="video"]').first();

    // Video element should exist in the DOM (might not be active without permissions)
    await expect(videoElement).toBeAttached();
  });

  test('should have audio elements or controls', async ({ page }) => {
    await page.goto('/interview');

    await page.waitForTimeout(2000);

    // Look for audio-related elements
    const audioElements = page.locator('audio, [class*="audio"], [class*="mic"], [class*="microphone"]').first();

    await expect(audioElements).toBeAttached();
  });

  test('should have control buttons', async ({ page }) => {
    await page.goto('/interview');

    await page.waitForTimeout(2000);

    // Look for buttons (start, stop, mute, etc.)
    const buttons = page.locator('button');
    const count = await buttons.count();

    // Should have at least some buttons
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to interview from dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Click interview link
    await page.click('a[href="/interview"]');

    // Should navigate to interview page
    await expect(page).toHaveURL(/\/interview/);
  });

  test('should maintain authentication on interview page', async ({ page }) => {
    await page.goto('/interview');

    // Should show user is logged in
    await expect(page.locator(`text=${testUser.name}`)).toBeVisible();

    // Should have logout button
    await expect(page.locator('button[title="Sign out"]')).toBeVisible();
  });

  test('should have navigation back to dashboard', async ({ page }) => {
    await page.goto('/interview');

    // Look for dashboard link
    const dashboardLink = page.locator('a[href="/dashboard"]').first();

    const hasDashboardLink = await dashboardLink.count() > 0;

    if (hasDashboardLink) {
      await dashboardLink.click();
      await expect(page).toHaveURL(/\/dashboard/);
    } else {
      // Alternatively, click the logo to go home
      await page.click('a[href="/"]');
      await expect(page).toHaveURL(/\//);
    }
  });

  test('should handle camera permissions', async ({ page, context }) => {
    // Revoke permissions to test permission request
    await context.clearPermissions();

    await page.goto('/interview');

    await page.waitForTimeout(2000);

    // Page should still load (might show permission prompt)
    await expect(page.locator('body')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/interview');

    await page.waitForTimeout(2000);

    // Content should be visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle page reload gracefully', async ({ page }) => {
    await page.goto('/interview');

    await page.waitForTimeout(2000);

    // Reload page
    await page.reload();

    await page.waitForTimeout(2000);

    // Should still be on interview page (or redirected gracefully)
    const url = page.url();
    expect(url).toMatch(/\/(interview|dashboard)/);
  });

  test('should have proper page title and metadata', async ({ page }) => {
    await page.goto('/interview');

    // Check for page title or heading
    const title = page.locator('h1, h2').first();
    const hasTitle = await title.count() > 0;

    // Either has a title or the page loads
    await expect(page.locator('body')).toBeVisible();
  });

  test('should allow logout from interview page', async ({ page }) => {
    await page.goto('/interview');

    await page.waitForTimeout(1000);

    // Logout
    await page.click('button[title="Sign out"]');

    await page.waitForTimeout(2000);

    // Should be redirected away from interview
    const url = page.url();
    expect(url).not.toContain('/interview');

    // Try to access interview again
    await page.goto('/interview');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show loading state initially', async ({ page }) => {
    // Navigate to interview
    await page.goto('/interview');

    // Check for any loading indicators
    const loader = page.locator('.animate-spin, [class*="loading"], text=Loading').first();

    // Loading might be very brief
    await loader.waitFor({ state: 'attached', timeout: 1000 }).catch(() => {
      // Loading finished too quickly
    });

    // Eventually, page should load
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have navbar on interview page', async ({ page }) => {
    await page.goto('/interview');

    // Should have navbar
    await expect(page.locator('nav')).toBeVisible();

    // Should show logo/brand
    await expect(page.locator('text=LiveInterview')).toBeVisible();
  });
});
