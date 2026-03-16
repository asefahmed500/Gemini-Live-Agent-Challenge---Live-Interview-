import { test, expect } from '@playwright/test';

test.describe('Site Navigation', () => {
  test.describe('Unauthenticated Navigation', () => {
    test('should navigate to landing page', async ({ page }) => {
      await page.goto('/');

      await expect(page).toHaveURL(/\//);
      await expect(page.locator('body')).toBeVisible();
      // Check for main heading
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should navigate to login page', async ({ page }) => {
      await page.goto('/login');

      await expect(page).toHaveURL(/\/login/);

      // Should show login form elements
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('text=Sign in')).toBeVisible();
    });

    test('should navigate to register page', async ({ page }) => {
      await page.goto('/register');

      await expect(page).toHaveURL(/\/register/);

      // Should show registration form
      await expect(page.locator('#name')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('text=Create an account')).toBeVisible();
    });

    test('should protect interview route', async ({ page }) => {
      await page.goto('/interview');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('should protect dashboard route', async ({ page }) => {
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('should protect session report route', async ({ page }) => {
      await page.goto('/dashboard/test-session');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Authenticated Navigation', () => {
    const generateTestUser = () => ({
      name: `Nav Test ${Date.now()}`,
      email: `nav-${Date.now()}@example.com`,
      password: 'NavPass123!',
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

      // Wait for navigation to dashboard
      await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    });

    test('should navigate to all authenticated pages', async ({ page }) => {
      // Dashboard should be accessible
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/dashboard/);

      // Interview should be accessible
      await page.goto('/interview');
      await expect(page).toHaveURL(/\/interview/);

      // Back to dashboard
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should update navbar based on auth state', async ({ page }) => {
      await page.goto('/');

      // Look for authenticated user elements
      const userName = page.locator(`text=${testUser.name}`);
      await expect(userName).toBeVisible({ timeout: 5000 });

      // Should show logout button (with title)
      await expect(page.locator('button[title="Sign out"]')).toBeVisible();

      // Should show Interview and Dashboard links
      await expect(page.locator('a[href="/interview"]')).toBeVisible();
      await expect(page.locator('a[href="/dashboard"]')).toBeVisible();
    });

    test('should show logout button when authenticated', async ({ page }) => {
      await page.goto('/');

      // Look for logout button
      const logoutButton = page.locator('button[title="Sign out"]');
      await expect(logoutButton).toBeVisible({ timeout: 5000 });
    });

    test('should allow navigation via navbar links', async ({ page }) => {
      await page.goto('/');

      // Click dashboard link
      await page.click('a[href="/dashboard"]');
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should handle browser back/forward navigation', async ({ page }) => {
      // Start at dashboard
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/dashboard/);

      // Navigate to interview
      await page.goto('/interview');
      await expect(page).toHaveURL(/\/interview/);

      // Go back
      await page.goBack();
      await expect(page).toHaveURL(/\/dashboard/);

      // Go forward
      await page.goForward();
      await expect(page).toHaveURL(/\/interview/);
    });

    test('should maintain auth state across page reloads', async ({ page }) => {
      await page.goto('/dashboard');

      // Reload page
      await page.reload();

      // Should still be on dashboard (not redirected to login)
      await expect(page).toHaveURL(/\/dashboard/);

      // User should still be visible
      await expect(page.locator(`text=${testUser.name}`)).toBeVisible();
    });
  });

  test.describe('Navigation Components', () => {
    test('should have functional navbar', async ({ page }) => {
      await page.goto('/');

      const navbar = page.locator('nav');
      await expect(navbar).toBeVisible();

      // Check for logo/brand
      await expect(page.locator('text=LiveInterview')).toBeVisible();
    });

    test('should have logo link to home', async ({ page }) => {
      await page.goto('/');

      // Click the logo/brand link
      await page.click('a[href="/"]');

      // Should stay on or navigate to home
      await expect(page).toHaveURL(/\//);
    });

    test('should be accessible via keyboard navigation', async ({ page }) => {
      await page.goto('/');

      // Tab through navigation
      await page.keyboard.press('Tab');

      // Focus should be on a navigable element
      const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
      expect(['A', 'BUTTON', 'INPUT']).toContain(focusedTag);
    });
  });

  test.describe('Redirect Behavior', () => {
    const generateTestUser = () => ({
      name: `Redirect Test ${Date.now()}`,
      email: `redirect-${Date.now()}@example.com`,
      password: 'RedirectPass123!',
    });

    test('should redirect to intended page after login', async ({ page }) => {
      const testUser = generateTestUser();

      // First register the user
      await page.goto('/register');
      await page.fill('#name', testUser.name);
      await page.fill('#email', testUser.email);
      await page.fill('#password', testUser.password);
      await page.fill('#confirmPassword', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/, { timeout: 15000 });

      // Logout
      await page.click('button[title="Sign out"]');

      // Try to access protected route
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);

      // Login again
      await page.fill('#email', testUser.email);
      await page.fill('#password', testUser.password);
      await page.click('button[type="submit"]');

      // After login, should redirect to dashboard
      await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    });

    test('should handle external redirects safely', async ({ page }) => {
      // This tests that the app doesn't have open redirect vulnerabilities
      await page.goto('/login?redirect=https://evil.com');

      // The redirect parameter should be ignored or validated
      const url = page.url();

      // Should not redirect to evil.com
      expect(url).not.toContain('evil.com');
    });
  });

  test.describe('Mobile Navigation', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Content should still be visible
      await expect(page.locator('text=LiveInterview')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
    });

    test('should be touch-friendly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Check for buttons/links (touch targets should be at least 44x44)
      const buttons = page.locator('button, a').first();
      await expect(buttons).toBeVisible();

      // Get button dimensions
      const box = await buttons.boundingBox();
      expect(box).toBeDefined();

      if (box) {
        // Check minimum touch target size (44x44 is iOS recommendation)
        expect(box.width).toBeGreaterThanOrEqual(40);
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    });
  });
});
