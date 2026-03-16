import { Page, Locator } from '@playwright/test';

/**
 * Playwright E2E Test Helpers
 *
 * Common utilities and helper functions for E2E tests
 */

export interface TestUser {
  name: string;
  email: string;
  password: string;
}

/**
 * Generates a unique test user with timestamp
 */
export function generateTestUser(prefix = 'e2e'): TestUser {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);

  return {
    name: `${prefix} User ${timestamp}`,
    email: `${prefix}-${timestamp}-${random}@example.com`,
    password: `TestPass${timestamp}!`,
  };
}

/**
 * Login helper - authenticates a user and returns to dashboard
 */
export async function loginUser(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login');
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');

  // Wait for navigation
  await page.waitForURL(/\/(dashboard|login)/, { timeout: 10000 });
}

/**
 * Register helper - creates a new user account
 */
export async function registerUser(page: Page, user: TestUser): Promise<void> {
  await page.goto('/register');
  await page.fill('input[name="name"]', user.name);
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');

  // Wait for navigation
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

/**
 * Logout helper - logs out the current user
 */
export async function logoutUser(page: Page): Promise<void> {
  await page.goto('/logout');
  await page.waitForTimeout(1000);
}

/**
 * Ensure authenticated - logs in if not already authenticated
 */
export async function ensureAuthenticated(page: Page, user: TestUser): Promise<boolean> {
  await page.goto('/');

  // Check if already authenticated
  const isLoggedIn = await page.locator(`text=${user.name}`).count() > 0;

  if (!isLoggedIn) {
    await loginUser(page, user);

    // Check if we need to register
    if (page.url().includes('/login')) {
      await registerUser(page, user);
    }

    return true;
  }

  return false;
}

/**
 * Wait for loading state to complete
 */
export async function waitForLoading(page: Page): Promise<void> {
  const loadingIndicator = page.locator(
    '[class*="loading"], [class*="skeleton"], [aria-busy="true"], [class*="spinner"]'
  );

  // Wait for loading to appear
  await loadingIndicator.first().waitFor({ state: 'attached', timeout: 2000 }).catch(() => {});

  // Wait for loading to disappear
  await loadingIndicator.first().waitFor({ state: 'detached', timeout: 10000 }).catch(() => {});
}

/**
 * Clear all cookies and local storage
 */
export async function clearSession(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Get the current theme from HTML element
 */
export async function getTheme(page: Page): Promise<string | null> {
  return await page.locator('html').getAttribute('class');
}

/**
 * Toggle theme via theme toggle button
 */
export async function toggleTheme(page: Page): Promise<void> {
  const themeToggle = page.locator(
    '[aria-label*="theme"], [class*="theme-toggle"], button:has-text("Theme")'
  ).first();

  await themeToggle.click();
  await page.waitForTimeout(500);
}

/**
 * Check if element is visible within viewport
 */
export async function isInViewport(page: Page, locator: Locator): Promise<boolean> {
  const isVisible = await locator.isVisible();
  if (!isVisible) return false;

  const box = await locator.boundingBox();
  if (!box) return false;

  const viewportSize = page.viewportSize();
  if (!viewportSize) return false;

  return (
    box.y >= 0 &&
    box.x >= 0 &&
    box.y + box.height <= viewportSize.height &&
    box.x + box.width <= viewportSize.width
  );
}

/**
 * Scroll element into view
 */
export async function scrollIntoView(page: Page, locator: Locator): Promise<void> {
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
}

/**
 * Take screenshot with automatic naming
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: `screenshots/${name}.png`,
    fullPage: true,
  });
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 30000
): Promise<void> {
  await page.waitForResponse(
    (response) => response.url().match(urlPattern) !== null,
    { timeout }
  );
}

/**
 * Get text content safely
 */
export async function getTextContent(locator: Locator): Promise<string> {
  try {
    return await locator.textContent() || '';
  } catch {
    return '';
  }
}

/**
 * Check if element exists without throwing
 */
export async function elementExists(locator: Locator): Promise<boolean> {
  return await locator.count() > 0;
}

/**
 * Safe click with retry
 */
export async function safeClick(locator: Locator, maxRetries = 3): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await locator.click({ timeout: 5000 });
      return;
    } catch {
      if (i === maxRetries - 1) throw;
      await locator.waitFor({ state: 'attached', timeout: 2000 });
    }
  }
}

/**
 * Mock media permissions for testing
 */
export async function mockMediaPermissions(page: Page): Promise<void> {
  const context = page.context();
  await context.grantPermissions(['camera', 'microphone']);
}

/**
 * Revoke media permissions
 */
export async function revokeMediaPermissions(page: Page): Promise<void> {
  const context = page.context();
  await context.clearPermissions();
}

/**
 * Set viewport to common device sizes
 */
export const deviceSizes = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  'desktop-small': { width: 1366, height: 768 },
};

/**
 * Test responsive behavior at multiple breakpoints
 */
export async function testResponsive(
  page: Page,
  testFn: (size: { width: number; height: number }) => Promise<void>
): Promise<void> {
  for (const [name, size] of Object.entries(deviceSizes)) {
    await page.setViewportSize(size);
    await page.waitForTimeout(500);
    await testFn(size);
  }
}

/**
 * Get all console messages
 */
export async function getConsoleMessages(page: Page): Promise<string[]> {
  const messages: string[] = [];

  page.on('console', (msg) => {
    messages.push(`[${msg.type()}] ${msg.text()}`);
  });

  return messages;
}

/**
 * Wait for element to stop moving (for animations)
 */
export async function waitForStablePosition(
  page: Page,
  locator: Locator,
  timeout = 5000
): Promise<void> {
  const startTime = Date.now();
  let previousBox: Awaited<ReturnType<typeof locator.boundingBox>> | null = null;
  let stableCount = 0;

  while (Date.now() - startTime < timeout) {
    const box = await locator.boundingBox();

    if (previousBox) {
      const isSame =
        box?.x === previousBox.x &&
        box?.y === previousBox.y &&
        box?.width === previousBox.width &&
        box?.height === previousBox.height;

      if (isSame) {
        stableCount++;
        if (stableCount >= 3) return;
      } else {
        stableCount = 0;
      }
    }

    previousBox = box;
    await page.waitForTimeout(100);
  }
}

/**
 * Fill form with data object
 */
export async function fillForm(
  page: Page,
  data: Record<string, string>
): Promise<void> {
  for (const [name, value] of Object.entries(data)) {
    const input = page.locator(`input[name="${name}"], textarea[name="${name}"], select[name="${name}"]`).first();
    await input.fill(value);
  }
}

/**
 * Get form values
 */
export async function getFormValues(
  page: Page,
  formSelector = 'form'
): Promise<Record<string, string>> {
  return await page.locator(formSelector).evaluate((form) => {
    const formData = new FormData(form as HTMLFormElement);
    const values: Record<string, string> = {};

    for (const [key, value] of formData.entries()) {
      values[key] = value as string;
    }

    return values;
  });
}
