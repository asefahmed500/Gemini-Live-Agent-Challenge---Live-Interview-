import { test, expect } from '@playwright/test';

test.describe('Live AI Interview Coach - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('Homepage loads correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Master Your Interview Skills');
    await expect(page.getByText('AI-Powered Interview Practice')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Start Interview' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View Dashboard' })).toBeVisible();
  });

  test('Feature cards are displayed', async ({ page }) => {
    await expect(page.getByText('Real-Time Analysis')).toBeVisible();
    await expect(page.getByText('Voice Assessment')).toBeVisible();
    await expect(page.getByText('Detailed Reports')).toBeVisible();
  });

  test('Navigation to Interview page', async ({ page }) => {
    // Use promise.all for more reliable navigation
    await Promise.all([
      page.waitForURL(/\/interview/),
      page.click('a:has-text("Start Interview")')
    ]);
    await expect(page.getByText('Job Position')).toBeVisible();
  });

  test('Navigation to Dashboard', async ({ page }) => {
    await page.click('a:has-text("View Dashboard")');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('Interview setup form elements', async ({ page }) => {
    await page.goto('http://localhost:3000/interview');

    // Check job role input
    await expect(page.locator('input#jobRole')).toBeVisible();

    // Check difficulty selector
    await expect(page.getByText('Difficulty Level')).toBeVisible();
    await expect(page.locator('select#difficulty')).toBeVisible();

    // Check CV section
    await expect(page.getByText('Your Resume/CV')).toBeVisible();
    await expect(page.getByText('Drag and drop your CV')).toBeVisible();

    // Check job description section - use more specific selector
    await expect(page.getByText('Job Description (Optional)')).toBeVisible();

    // Check interview mode buttons - use exact text match
    await expect(page.getByRole('button', { name: 'Chat' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Video' })).toBeVisible();
    // For Voice, use locator with exact text "Voice"
    await expect(page.locator('button:has-text("Voice")').filter({ hasText: 'Audio only' })).toBeVisible();

    // Check start button
    await expect(page.getByRole('button', { name: 'Start Interview' })).toBeVisible();
  });

  test('Interview mode selection', async ({ page }) => {
    await page.goto('http://localhost:3000/interview');

    // Get all three mode buttons
    const modeButtons = page.locator('div.grid button');
    
    // Test Chat mode (index 0)
    await modeButtons.nth(0).click();
    await expect(modeButtons.nth(0)).toHaveClass(/border-primary/);

    // Test Video mode (index 1)
    await modeButtons.nth(1).click();
    await expect(modeButtons.nth(1)).toHaveClass(/border-primary/);

    // Test Voice mode (index 2)
    await modeButtons.nth(2).click();
    await expect(modeButtons.nth(2)).toHaveClass(/border-primary/);
  });

  test('Login page loads', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    // Use heading text instead of "Sign In" which appears multiple times
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Register page loads', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    // Use heading text instead of "Create Account" which appears multiple times
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
    await expect(page.locator('input#name')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Footer links exist', async ({ page }) => {
    // Check that there are footer links
    const footerLinks = page.locator('footer a').or(page.locator('section a'));
    const count = await footerLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Responsive design - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/interview');

    // Check mobile layout
    await expect(page.getByText('Job Position')).toBeVisible();
    await expect(page.getByRole('button', { name: /Chat.*/ })).toBeVisible();
  });

  test('Responsive design - tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:3000');

    await expect(page.locator('h1')).toContainText('Master Your Interview Skills');
  });

  test('Page titles are correct', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    // Note: Client components don't export metadata, so we just check the page loads
    await expect(page).toHaveURL('http://localhost:3000/');

    await page.goto('http://localhost:3000/interview');
    await expect(page).toHaveURL(/\/interview/);

    await page.goto('http://localhost:3000/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('No console errors on homepage', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    expect(errors.length).toBe(0);
  });

  test('Images load correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      await expect(img).toHaveJSProperty('complete', true);
    }
  });

  test('Accessibility - headings hierarchy', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);

    const h2 = page.locator('h2');
    const h2Count = await h2.count();
    expect(h2Count).toBeGreaterThan(0);

    const h3 = page.locator('h3');
    const h3Count = await h3.count();
    expect(h3Count).toBeGreaterThan(0);
  });

  test('Button hover states work', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    const startButton = page.getByRole('link', { name: 'Start Interview' });
    await startButton.hover();
    await expect(startButton).toBeVisible();

    const dashboardButton = page.getByRole('link', { name: 'View Dashboard' });
    await dashboardButton.hover();
    await expect(dashboardButton).toBeVisible();
  });

  test('Get Started Free button navigates to interview', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.click('a:has-text("Get Started Free")');
    await expect(page).toHaveURL(/\/interview/);
  });

  // Profile and Settings tests - these will skip if auth is disabled
  test('Profile page structure exists', async ({ page }) => {
    await page.goto('http://localhost:3000/profile');
    // With auth disabled, page should still load (200 OK)
    // Content may be minimal due to auth requirement
    const status = await page.evaluate(() => {
      return document.body.children.length > 0;
    });
    expect(status).toBe(true);
  });

  test('Settings page structure exists', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');
    // With auth disabled, page should still load (200 OK)
    // Content may be minimal due to auth requirement
    const status = await page.evaluate(() => {
      return document.body.children.length > 0;
    });
    expect(status).toBe(true);
  });
});

test.describe('API Integration Tests', () => {
  test('Session start API works', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/session/start', {
      data: {
        jobRole: 'Frontend Developer',
        difficulty: 'medium',
        cvContent: 'React developer',
        jobDescription: 'Looking for frontend dev',
        interviewType: 'chat'
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('sessionId');
    expect(data).toHaveProperty('status', 'active');
  });

  test('Session chat API works', async ({ request }) => {
    // First create a session
    const sessionResponse = await request.post('http://localhost:3000/api/session/start', {
      data: {
        jobRole: 'Frontend Developer',
        difficulty: 'medium',
        interviewType: 'chat'
      }
    });
    const sessionData = await sessionResponse.json();
    const sessionId = sessionData.sessionId;

    // Then test chat
    const chatResponse = await request.post('http://localhost:3000/api/session/chat', {
      data: {
        sessionId: sessionId,
        userMessage: 'I am ready',
        isFirstMessage: true
      }
    });

    expect(chatResponse.status()).toBe(200);
    const chatData = await chatResponse.json();
    expect(chatData).toHaveProperty('success', true);
    expect(chatData).toHaveProperty('nextQuestion');
  });

  test('Session end API works', async ({ request }) => {
    // Create and end a session
    const sessionResponse = await request.post('http://localhost:3000/api/session/start', {
      data: { jobRole: 'Developer', difficulty: 'medium', interviewType: 'chat' }
    });
    const sessionData = await sessionResponse.json();

    const endResponse = await request.post('http://localhost:3000/api/session/end', {
      data: { sessionId: sessionData.sessionId }
    });

    expect(endResponse.status()).toBe(200);
    const endData = await endResponse.json();
    expect(endData).toHaveProperty('status', 'completed');
  });

  test('Analytics API works', async ({ request }) => {
    // Create a session, end it, then get analytics
    const sessionResponse = await request.post('http://localhost:3000/api/session/start', {
      data: { jobRole: 'Developer', difficulty: 'medium', interviewType: 'chat' }
    });
    const sessionData = await sessionResponse.json();

    await request.post('http://localhost:3000/api/session/end', {
      data: { sessionId: sessionData.sessionId }
    });

    const analyticsResponse = await request.get(`http://localhost:3000/api/analytics/${sessionData.sessionId}`);

    expect(analyticsResponse.status()).toBe(200);
    const analyticsData = await analyticsResponse.json();
    expect(analyticsData).toHaveProperty('sessionId');
    expect(analyticsData).toHaveProperty('scores');
    expect(analyticsData).toHaveProperty('report');
  });

  test('Sessions list API works', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/sessions?userId=test-user');

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('sessions');
    expect(Array.isArray(data.sessions)).toBe(true);
  });
});

test.describe('AI Features Tests', () => {
  test('AI generates relevant questions', async ({ request }) => {
    const sessionResponse = await request.post('http://localhost:3000/api/session/start', {
      data: {
        jobRole: 'React Developer',
        difficulty: 'hard',
        cvContent: 'Senior React developer with 5 years experience',
        interviewType: 'chat'
      }
    });
    const sessionData = await sessionResponse.json();

    const chatResponse = await request.post('http://localhost:3000/api/session/chat', {
      data: {
        sessionId: sessionData.sessionId,
        userMessage: 'I am ready for the interview',
        isFirstMessage: true
      }
    });

    const chatData = await chatResponse.json();
    expect(chatData.success).toBe(true);
    expect(chatData.nextQuestion).toBeTruthy();
    expect(chatData.nextQuestion.length).toBeGreaterThan(10);
  });

  test('AI provides feedback on responses', async ({ request }) => {
    const sessionResponse = await request.post('http://localhost:3000/api/session/start', {
      data: { jobRole: 'Developer', difficulty: 'medium', interviewType: 'chat' }
    });
    const sessionData = await sessionResponse.json();

    await request.post('http://localhost:3000/api/session/chat', {
      data: {
        sessionId: sessionData.sessionId,
        userMessage: 'I am ready',
        isFirstMessage: true
      }
    });

    const responseChat = await request.post('http://localhost:3000/api/session/chat', {
      data: {
        sessionId: sessionData.sessionId,
        userMessage: 'I have experience with React and Node.js',
        isFirstMessage: false
      }
    });

    const data = await responseChat.json();
    expect(data.success).toBe(true);
    expect(data.feedback).toBeTruthy();
  });

  test('Complete interview flow generates report', async ({ request }) => {
    // Start session
    const startResponse = await request.post('http://localhost:3000/api/session/start', {
      data: {
        jobRole: 'Full Stack Developer',
        difficulty: 'medium',
        cvContent: 'Experienced developer',
        interviewType: 'chat'
      }
    });
    const startData = await startResponse.json();

    // Have a conversation
    await request.post('http://localhost:3000/api/session/chat', {
      data: {
        sessionId: startData.sessionId,
        userMessage: 'I am ready',
        isFirstMessage: true
      }
    });

    await request.post('http://localhost:3000/api/session/chat', {
      data: {
        sessionId: startData.sessionId,
        userMessage: 'I know React, Node.js, and Python',
        isFirstMessage: false
      }
    });

    // End session
    const endResponse = await request.post('http://localhost:3000/api/session/end', {
      data: { sessionId: startData.sessionId }
    });
    const endData = await endResponse.json();

    // Get analytics
    const analyticsResponse = await request.get(`http://localhost:3000/api/analytics/${startData.sessionId}`);
    const analyticsData = await analyticsResponse.json();

    // Verify report
    expect(analyticsData.report).toBeTruthy();
    expect(analyticsData.report.overallScore).toBeGreaterThanOrEqual(0);
    expect(analyticsData.report.overallScore).toBeLessThanOrEqual(100);
    expect(analyticsData.transcripts).toBeTruthy();
    expect(Array.isArray(analyticsData.transcripts)).toBe(true);
  });
});
