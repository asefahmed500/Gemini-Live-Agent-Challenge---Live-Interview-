# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Live AI Interview Coach - A real-time multimodal AI agent that simulates technical job interviews using:
- **Gemini 2.0 Flash** for AI interview interactions
- **Better Auth 1.4** for authentication
- **Prisma 5** with PostgreSQL for data
- **Next.js 16.1** App Router with Turbopack
- **Vitest** for unit/integration/component tests
- **Playwright** for E2E tests (27 tests, 100% passing)

## Development Commands

```bash
# Start development server (port 3000)
npm run dev              # Standard Next.js dev server
npm run dev:turbo        # With Turbopack (faster)

# Start WebSocket server separately (port 3001)
npm run ws:dev

# Start both servers together
npm run dev:all

# Production build
npm run build
npm start                # Runs on port 3000

# Testing - Vitest (unit, integration, component)
npm run test              # Watch mode
npm run test:run          # Run once
npm run test:ui           # Open Vitest UI
npm run test:coverage     # Generate coverage report
npx vitest tests/path/to/test.test.ts              # Single file
npx vitest tests/path/to/test.test.ts -t "test name"  # Single test

# Testing - Playwright E2E
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Open Playwright UI
npm run test:e2e:debug    # Debug mode
npm run test:e2e:headed   # Run with visible browser
npx playwright test --list  # List all tests
npx playwright test tests/e2e/complete-feature-test.spec.ts  # Run specific file

# Run all tests
npm run test:all          # Run both Vitest and Playwright

# Database operations
npx prisma generate       # Generate Prisma Client after schema changes
npx prisma db push        # Push schema to database (development)
npx prisma studio         # Open Prisma Studio to inspect database

# Docker (PostgreSQL + PG Admin)
docker-compose up -d      # Start database services
docker-compose down       # Stop database services

# Code quality
npm run lint              # ESLint
npm run format            # Prettier
npm run typecheck         # TypeScript check
```

## Architecture Overview

### Stack & Frameworks
- **Next.js 16.1** with App Router and Turbopack
- **Better Auth 1.4** for authentication (email/password)
- **Prisma 5** ORM with PostgreSQL
- **Gemini 2.0 Flash** for AI interview interactions
- **Tailwind CSS v4** with dark theme
- **Vitest + Testing Library + MSW** for unit/integration/component tests
- **Playwright** for E2E testing

### Directory Structure
```
app/
├── (auth)/              # Route group for auth pages (login, register)
├── api/
│   ├── auth/[...all]/   # Better Auth API handler
│   ├── analytics/       # Session analytics endpoint
│   ├── session/         # Interview session CRUD (start, chat, end)
│   └── sessions/        # List user sessions
├── dashboard/[id]/      # Protected dashboard with session details
├── interview/           # Live interview page (setup + active session)
├── login/               # Login page
├── register/            # Registration page
├── profile/             # User profile page
├── settings/            # User settings page
├── layout.tsx           # Root layout with metadata
└── page.tsx             # Landing page

components/
├── ui/                  # Base UI components (shadcn/okech theme)
├── interview/           # Interview-specific components
│   ├── setup-form.tsx   # Interview configuration form
│   ├── video-feed.tsx   # Camera display
│   ├── audio-waveform.tsx
│   ├── confidence-meter.tsx
│   ├── transcript-panel.tsx
│   └── interview-controls.tsx
├── dashboard/           # Dashboard components
└── layout/
    ├── navbar.tsx       # Enhanced with profile dropdown
    └── footer.tsx

hooks/
├── use-websocket.ts     # WebSocket connection manager
├── use-media-stream.ts  # Camera/mic stream handler
├── use-audio-playback.ts # AI voice playback
├── use-confidence-score.ts # Live score state
├── use-speech-to-text.ts # STT hook
└── use-text-to-speech.ts # TTS hook

lib/
├── auth.ts              # Better Auth server config
├── auth-client.ts       # Better Auth client config
├── db.ts                # Prisma client singleton
├── gemini.ts            # Gemini AI integration
├── audio-processor.ts   # Audio utilities
├── vision-analyzer.ts   # Face analysis (requires models)
└── face-analyzer-fallback.ts # Simulated face analysis (when models missing)

server/
└── ws-server.ts         # WebSocket server (port 3001)

tests/
├── setup.ts             # Global test configuration (MSW, mocks)
├── e2e/                 # Playwright E2E tests
│   ├── auth.spec.ts           # Auth flow tests
│   ├── dashboard.spec.ts      # Dashboard functionality
│   ├── interview.spec.ts      # Interview workflow
│   ├── navigation.spec.ts     # Navigation tests
│   └── complete-feature-test.spec.ts  # Comprehensive test suite (27 tests)
├── integration/         # API route tests
├── components/          # Component tests
├── unit/                # Utility and hook tests
└── utils/               # Test helpers and mocks

types/
├── session.ts           # Interview session types
├── analytics.ts         # Analytics types
└── messages.ts          # WebSocket message types
```

### Route Protection

Protected routes use middleware that checks for `better-auth.session_token` cookie.

**Protected paths**: `/interview`, `/dashboard`, `/profile`, `/settings`

**Important**: When adding new protected routes, add them to the `protectedPaths` array in `middleware.ts`.

**Local Development**: Set `DISABLE_AUTH = true` in `middleware.ts` to bypass authentication for testing.

## Authentication (Better Auth)

### Server Configuration (`lib/auth.ts`)
```typescript
emailAndPassword: {
  enabled: true,
  requireEmailVerification: false,
  hashPassword: async (password) => await bcrypt.hash(password, 10),
}
```

### Client Usage
```typescript
import { signIn, signUp, useSession, signOut } from "@/lib/auth-client"

// In components
const { data: session, isPending } = useSession()

// Sign in
await signIn.email({ email, password })

// Sign up
await signUp.email({ email, password, name })

// Sign out
await signOut()
```

### Server-Side Auth Check
```typescript
import { auth } from "@/lib/auth"
const session = await auth.api.getSession({ headers: request.headers })
```

### Known Issue: Auth Registration
Better Auth 1.4+ requires explicit `hashPassword` function (already implemented). If registration still fails, use `DISABLE_AUTH = true` in middleware for local development.

## Database (Prisma + PostgreSQL)

### Key Models
- **User, Session, Account** - Better Auth models (do not modify manually)
- **InterviewSession** - Interview with scores, jobRole, difficulty, status
- **Transcript** - Conversation messages (role: user/assistant/system)
- **ConfidenceLog** - Real-time confidence metrics
- **Report** - Post-session AI-generated analysis

### Database Connection
Uses Prisma singleton pattern in `lib/db.ts`. Database URL from `DATABASE_URL` env variable.

### Local Development
PostgreSQL runs in Docker via `docker-compose.yml`:
- Database: `localhost:5432`
- PG Admin: `http://localhost:5050` (admin@interview.local / admin)

## Interview Flow

### Session Lifecycle
1. User fills setup form (job role, difficulty, CV, job description, mode)
2. POST `/api/session/start` → Creates `InterviewSession` record, returns session_id
3. POST `/api/session/chat` with `isFirstMessage: true` → AI asks first question
4. User responds via chat/voice
5. POST `/api/session/chat` → AI provides feedback and asks follow-up
6. Repeat steps 4-5 for conversation
7. POST `/api/session/end` → Calculates final scores, generates `Report`
8. Redirect to dashboard with session details

### WebSocket Message Types (`types/messages.ts`)
- **AudioMessage** - PCM audio data from user
- **VideoMessage** - Base64 JPEG frames for vision analysis
- **TranscriptMessage** - Conversation text
- **ConfidenceMessage** - Live confidence metrics
- **ControlMessage** - Start/stop/pause actions

### Face Analysis
**Production**: Requires face-api.js models in `/public/models/`:
- `tiny_face_detector_model-weights_manifest.json`
- `face_landmark_68_model-weights_manifest.json`
- `face_recognition_model-weights_manifest.json`
- `face_expression_model-weights_manifest.json`

**Fallback**: If models missing, `lib/face-analyzer-fallback.ts` provides simulated analysis based on interview context (answering, listening, thinking).

### Hooks Pattern
- **useWebSocket** - Manages WebSocket connection with auto-reconnect
- **useMediaStream** - Wraps `navigator.mediaDevices.getUserMedia()`
- **useAudioPlayback** - Handles AI voice playback via Web Audio API
- **useConfidenceScore** - Tracks score history and calculates trends

## Testing

### Test Frameworks
- **Vitest** for unit, integration, and component tests
- **Playwright** for end-to-end (E2E) browser tests
- **Testing Library** for component testing
- **MSW (Mock Service Worker)** for API mocking
- **jsdom** for DOM environment

### Test Status
- **E2E Tests**: 27/27 passing (100%) in `complete-feature-test.spec.ts`
- **Total Coverage**: ~188 tests (Vitest + Playwright)

### Test Setup (`tests/setup.ts`)
Critical mocks for interview functionality:
- **MediaStream & mediaDevices** - Mock camera/mic access
- **WebSocket** - Mock WebSocket for real-time communication
- **IntersectionObserver & ResizeObserver** - Browser API mocks
- **window.matchMedia** - Theme/media query mocks
- **MSW handlers** - API route mocks for auth, session, analytics

### Playwright Testing Notes
**Important**: The Playwright config has `baseURL: 'http://localhost:3007'` but the dev server runs on port 3000. Use absolute URLs in tests or update the config.

**Navigation Pattern for Next.js**: Use `Promise.all()` for reliable navigation:
```typescript
await Promise.all([
  page.waitForURL(/\/interview/),
  page.click('a:has-text("Start Interview")')
]);
```

**Avoid Strict Mode Violations**: Use specific selectors:
```typescript
// Good
await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

// Bad - matches multiple elements
await expect(page.getByText('Sign In')).toBeVisible();
```

### Running Tests
```bash
# Vitest (unit, integration, component)
npm run test          # Watch mode
npm run test:run      # Run once
npm run test:ui       # Vitest UI
npx vitest path/to/test.test.ts  # Single file

# Playwright E2E
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Playwright UI mode
npm run test:e2e:debug    # Debug mode
npm run test:e2e:headed   # Run with visible browser
npx playwright test tests/e2e/complete-feature-test.spec.ts  # Single file

# Run all tests
npm run test:all          # Run both Vitest and Playwright
```

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...all]` | GET/POST | Better Auth handler |
| `/api/session/start` | POST | Create interview session |
| `/api/session/chat` | POST | Send message, get AI response |
| `/api/session/end` | POST | End session, generate report |
| `/api/sessions` | GET | List user's sessions |
| `/api/analytics/[session_id]` | GET | Get session details + report |

## Environment Variables

Required in `.env`:
```bash
DATABASE_URL="postgresql://interview_user:password@localhost:5432/live_interview"
GEMINI_API_KEY="your-gemini-api-key"
BETTER_AUTH_SECRET="min-32-char-secret"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"  # WebSocket server
```

See `.env.example` for all available variables.

## Important Notes

### Next.js 16 Quirks
- `params` in dynamic routes is a Promise: `await params.session_id`
- `useSearchParams()` must be wrapped in `<Suspense>` boundary
- Client components cannot export metadata

### Type Safety
- `useRef<T>()` requires an initial value (e.g., `useRef<string | undefined>(undefined)`)
- Better Auth types are inferred, don't import from packages

### Build Output
- `output: 'standalone'` in `next.config.mjs` for Docker deployment
- Build produces `.next/standalone` for containerization

### Deployment Considerations
- WebSocket connections need a separate server (Next.js doesn't support WebSockets natively)
- WebSocket server runs on port 3001, main app on port 3000
- Consider using SSE for server→client streaming as an alternative
- Dockerfile and vercel.json provided for deployment

### Testing with Auth Disabled
For local E2E testing without authentication:
1. Set `DISABLE_AUTH = true` in `middleware.ts`
2. Profile/Settings pages will redirect to login or show minimal content
3. All other pages will be accessible

### Known Issues & Workarounds
1. **Auth Registration 500 Error** - Fixed with `hashPassword` function, but may still occur. Use `DISABLE_AUTH` for testing.
2. **Theme Provider Crash** - Fixed with `event.key?.toLowerCase()`
3. **Next.js Dev Overlay** - Can block Playwright clicks. Tests use Promise.all for reliability.

## Additional Documentation

- **`AGENTS.md`** - Agentic coding guidelines and style conventions
- **`prd.md`** - Complete product requirements document
- **`FINAL-TEST-RESULTS.md`** - Latest E2E test results (27/27 passing)
- **`README.md`** - Project overview and quick start guide
