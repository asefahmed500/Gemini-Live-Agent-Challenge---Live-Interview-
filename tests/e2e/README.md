# Playwright E2E Tests

End-to-end tests for the Live AI Interview Coach application using Playwright with Chromium.

## Test Structure

```
tests/e2e/
├── auth.spec.ts           # Authentication flow tests (10 tests)
├── dashboard.spec.ts       # Dashboard functionality tests (9 tests)
├── interview.spec.ts       # Interview workflow tests (11 tests)
├── navigation.spec.ts      # Site navigation tests (23 tests)
├── session-report.spec.ts  # Session report tests (10 tests)
└── utils/
    ├── test-helpers.ts     # Common test utilities
    └── mock-data.ts        # Test data fixtures
```

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run with headed mode (see browser)
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug

# List all tests
npx playwright test --list

# Run specific test file
npx playwright test auth.spec.ts

# Run tests matching a pattern
npx playwright test --grep "authentication"
```

## Test Coverage

### Authentication Flow (10 tests)
- Redirect unauthenticated users to login
- User registration
- User login
- Session persistence
- Invalid credentials handling
- Email validation
- Logout functionality
- User avatar display
- Return URL redirects

### Dashboard Functionality (9 tests)
- Dashboard display
- User statistics
- Session cards
- Loading states
- Navigation
- Responsiveness
- User preferences

### Interview Workflow (11 tests)
- Camera/mic permissions
- Session start
- Video feed
- Audio visualization
- Confidence meter
- Interview controls
- Transcript panel
- Session ending

### Site Navigation (23 tests)
- Unauthenticated navigation
- Authenticated navigation
- Protected routes
- Browser back/forward
- Mobile navigation
- Keyboard accessibility
- Redirect behavior

### Session Report (10 tests)
- Session details
- Score breakdown
- AI-generated reports
- Confidence trends
- Transcript display
- Session metadata

## Configuration

Playwright is configured in `playwright.config.ts`:
- Browser: Chromium
- Base URL: http://localhost:3000
- Dev server: Auto-started with `npm run dev`
- Timeout: 30s navigation, 10s actions
- Screenshots/Video: Captured on failure

## Helper Functions

Common utilities are available in `tests/e2e/utils/test-helpers.ts`:
- `loginUser(page, user)` - Authenticate user
- `registerUser(page, user)` - Create account
- `generateTestUser(prefix)` - Generate unique test user
- `waitForLoading(page)` - Wait for loading states
- `mockMediaPermissions(page)` - Grant camera/mic access
- And more...

## Mock Data

Test fixtures are available in `tests/e2e/utils/mock-data.ts`:
- Sample users
- Interview sessions
- Job roles
- Score categories
- Transcript messages
- API responses

## Troubleshooting

### Tests fail with "Cannot connect to dev server"
Ensure the Next.js dev server is running:
```bash
npm run dev
```

### Tests fail with database errors
Ensure PostgreSQL is running:
```bash
docker-compose up -d
```

### Camera/mic permission errors
Tests automatically grant permissions. If issues persist, check browser settings.

### Port conflicts
Ensure port 3000 is available:
```bash
# Windows
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <pid> /F
```
