import { test, expect } from '@playwright/test';

test.describe('Live AI Interview Coach - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('Homepage loads correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Master Your Interview Skills');
    await expect(page.locator('text=AI-Powered Interview Practice')).toBeVisible();
    await expect(page.locator('button:has-text("Start Interview")')).toBeVisible();
    await expect(page.locator('button:has-text("View Dashboard")')).toBeVisible();
  });

  test('Feature cards are displayed', async ({ page }) => {
    await expect(page.locator('text=Real-Time Analysis')).toBeVisible();
    await expect(page.locator('text=Voice Assessment')).toBeVisible();
    await expect(page.locator('text=Detailed Reports')).toBeVisible();
  });

  test('Navigation to Interview page', async ({ page }) => {
    await page.click('button:has-text("Start Interview")');
    await expect(page).toHaveURL(/\/interview/);
    await expect(page.locator('text=Job Position')).toBeVisible();
  });

  test('Navigation to Dashboard', async ({ page }) => {
    await page.click('button:has-text("View Dashboard")');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('Interview setup form elements', async ({ page }) => {
    await page.goto('http://localhost:3000/interview');

    // Check job role input
    await expect(page.locator('input[placeholder*="Frontend Developer"]')).toBeVisible();

    // Check difficulty selector
    await expect(page.locator('text=Difficulty Level')).toBeVisible();

    // Check CV section
    await expect(page.locator('text=Your Resume/CV')).toBeVisible();
    await expect(page.locator('text=Drag and drop your CV')).toBeVisible();

    // Check job description
    await expect(page.locator('text=Job Description')).toBeVisible();

    // Check interview mode buttons
    await expect(page.locator('button:has-text("Chat")')).toBeVisible();
    await expect(page.locator('button:has-text("Video")')).toBeVisible();
    await expect(page.locator('button:has-text("Voice")')).toBeVisible();

    // Check start button
    await expect(page.locator('button:has-text("Start Interview")')).toBeVisible();
  });

  test('Interview mode selection', async ({ page }) => {
    await page.goto('http://localhost:3000/interview');

    // Test Chat mode
    await page.click('button:has-text("Chat")');
    await expect(page.locator('button:has-text("Chat")')).toHaveAttribute('class', /active/);

    // Test Video mode
    await page.click('button:has-text("Video")');
    await expect(page.locator('button:has-text("Video")')).toHaveAttribute('class', /active/);

    // Test Voice mode
    await page.click('button:has-text("Voice")');
    await expect(page.locator('button:has-text("Voice")')).toHaveAttribute('class', /active/);
  });

  test('Profile page loads', async ({ page }) => {
    await page.goto('http://localhost:3000/profile');
    await expect(page.locator('h1:has-text("Profile")')).toBeVisible();
    await expect(page.locator('text=Account Information')).toBeVisible();
  });

  test('Settings page loads', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
    await expect(page.locator('text=Notifications')).toBeVisible();
    await expect(page.locator('text=Security')).toBeVisible();
  });

  test('Login page loads', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await expect(page.locator('text=Sign In')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Register page loads', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await expect(page.locator('text=Create Account')).toBeVisible();
    await expect(page.locator('input[placeholder*="John Doe"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="you@example.com"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="password"]')).toBeVisible();
  });

  test('Navbar links work', async ({ page }) => {
    // Test logo link
    await page.click('a:has-text("LiveInterview")');
    await expect(page).toHaveURL('http://localhost:3000/');

    // Test interview link
    await page.click('a:has-text("Interview")');
    await expect(page).toHaveURL(/\/interview/);

    // Test dashboard link
    await page.click('a:has-text("Dashboard")');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('Footer links exist', async ({ page }) => {
    await expect(page.locator('a:has-text("Features")')).toHaveCount(2);
    await expect(page.locator('a:has-text("Privacy")')).toBeVisible();
    await expect(page.locator('a:has-text("Terms")')).toBeVisible();
  });

  test('Responsive design - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/interview');

    // Check mobile layout
    await expect(page.locator('text=Job Position')).toBeVisible();
    await expect(page.locator('button:has-text("Chat")')).toBeVisible();
  });

  test('Responsive design - tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:3000');

    await expect(page.locator('h1')).toContainText('Master Your Interview Skills');
  });

  test('Page titles are correct', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await expect(page).toHaveTitle(/LiveInterview/);

    await page.goto('http://localhost:3000/interview');
    await expect(page).toHaveTitle(/Interview/);

    await page.goto('http://localhost:3000/dashboard');
    await expect(page).toHaveTitle(/Dashboard/);
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
    await expect(h2).toBeVisible();

    const h3 = page.locator('h3');
    await expect(h3).toHaveCountGreaterThan(0);
  });

  test('Button hover states work', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    const startButton = page.locator('button:has-text("Start Interview")');
    await startButton.hover();
    await expect(startButton).toBeVisible();

    const dashboardButton = page.locator('button:has-text("View Dashboard")');
    await dashboardButton.hover();
    await expect(dashboardButton).toBeVisible();
  });

  test('Get Started Free button navigates to interview', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.click('a:has-text("Get Started Free")');
    await expect(page).toHaveURL(/\/interview/);
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
