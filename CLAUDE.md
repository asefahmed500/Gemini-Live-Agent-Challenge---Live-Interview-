# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Live AI Interview Coach - A real-time multimodal AI agent that simulates technical job interviews using:
- **Gemini Live API** for voice/video streaming
- **Better Auth** for authentication
- **Prisma** with PostgreSQL for data
- **Next.js 16** App Router
- **Vitest** for unit/integration/component tests
- **Playwright** for E2E tests

## Development Commands

```bash
# Start development server (Turbopack on port 3000)
npm run dev

# Start WebSocket server separately (port 3001)
npm run ws:dev

# Start both dev and WebSocket servers together
npm run dev:all

# Production build
npm run build

# Start production server
npm start

# Testing - Vitest (unit, integration, component)
npm run test              # Watch mode
npm run test:run          # Run once
npm run test:ui           # Open Vitest UI
npm run test:coverage     # Generate coverage report
npx vitest tests/path/to/test.test.ts  # Single file

# Testing - Playwright E2E
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Open Playwright UI
npm run test:e2e:debug    # Debug mode
npm run test:e2e:headed   # Run with visible browser
npx playwright test --list  # List all tests

# Run all tests
npm run test:all

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
- **Better Auth 1.4** for authentication (email/password, OAuth ready)
- **Prisma 5** ORM with PostgreSQL
- **Gemini 2.0 Flash** for AI interview interactions
- **Tailwind CSS v4** with dark theme
- **Vitest + Testing Library + MSW** for comprehensive testing
- **Playwright** for E2E testing

### Directory Structure
```
app/
├── (auth)/              # Route group for auth pages
│   ├── login/           # Better Auth login
│   └── register/        # Better Auth registration
├── api/
│   ├── auth/[...all]/   # Better Auth API handler
│   ├── analytics/       # Session analytics endpoint
│   ├── session/         # Interview session CRUD
│   └── sessions/        # List user sessions
├── dashboard/           # Protected dashboard route
├── interview/           # Live interview page (protected)
├── login/               # Login page
├── register/            # Registration page
├── layout.tsx           # Root layout
└── page.tsx             # Landing page

components/
├── ui/                  # Base UI components (shadcn)
├── interview/           # Interview-specific components
├── dashboard/           # Dashboard components
└── layout/              # Navbar, Footer

hooks/
├── use-websocket.ts     # WebSocket connection manager
├── use-media-stream.ts  # Camera/mic stream handler
├── use-audio-playback.ts # AI voice playback
└── use-confidence-score.ts # Live score state

lib/
├── auth.ts              # Better Auth server config
├── auth-client.ts       # Better Auth client config
├── db.ts                # Prisma client singleton
├── gemini.ts            # Gemini AI integration
├── audio-processor.ts   # Audio utilities
└── vision-analyzer.ts   # Vision analysis utilities

tests/
├── setup.ts             # Global test configuration (MSW, mocks)
├── e2e/                 # Playwright E2E tests
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

Protected routes use middleware that checks for `better-auth.session_token` cookie. Redirects to `/login?redirect=...` if not authenticated.

**Protected paths**: `/interview`, `/dashboard`

**Important**: When adding new protected routes, add them to the `protectedPaths` array in `middleware.ts`.

**Local Development**: Set `DISABLE_AUTH = true` in `middleware.ts` to bypass authentication.

## Authentication (Better Auth)

### Server Configuration (`lib/auth.ts`)
- Uses Prisma adapter with PostgreSQL
- Email/password enabled with `bcryptjs` hashPassword function
- Sessions expire after 7 days
- Google OAuth ready (requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` env vars)

### Client Usage
```typescript
import { signIn, signUp, useSession } from "@/lib/auth-client"

// In components
const { data: session, isPending } = useSession()

// Sign in
await signIn.email({ email, password })

// Sign up
await signUp.email({ email, password, name })
```

### Server-Side Auth Check
```typescript
import { auth } from "@/lib/auth"

const session = await auth.api.getSession({ headers: request.headers })
```

### Known Issue: Auth Registration
Better Auth 1.4+ requires explicit `hashPassword` function (already implemented in `lib/auth.ts`):
```typescript
emailAndPassword: {
  enabled: true,
  requireEmailVerification: false,
  hashPassword: async (password) => await bcrypt.hash(password, 10),
}
```

## Database (Prisma + PostgreSQL)

### Key Models
- **User, Session, Account** - Better Auth models (do not modify manually)
- **InterviewSession** - Interview with scores, jobRole, difficulty, status
- **Transcript** - Conversation messages (role: user/assistant/system)
- **ConfidenceLog** - Real-time confidence metrics (eyeContact, posture, facialExpression, etc.)
- **Report** - Post-session AI-generated analysis

### Database Connection
Uses Prisma singleton pattern in `lib/db.ts`. Database URL from `DATABASE_URL` env variable.

### Local Development
PostgreSQL runs in Docker via `docker-compose.yml`:
- Database: `localhost:5432`
- PG Admin: `http://localhost:5050` (admin@interview.local / admin)

## Interview Flow

### Session Lifecycle
1. User grants camera/mic permissions → `useMediaStream` hook
2. POST `/api/session/start` → Creates `InterviewSession` record, returns session_id
3. Client sends audio/video chunks via WebSocket (runs on port 3001)
4. Vision analysis updates confidence scores every ~2 seconds
5. POST `/api/session/end` → Calculates final scores, generates `Report`
6. Redirect to dashboard with session details

### WebSocket Message Types (`types/messages.ts`)
- **AudioMessage** - PCM audio data from user
- **VideoMessage** - Base64 JPEG frames for vision analysis
- **TranscriptMessage** - Conversation text
- **ConfidenceMessage** - Live confidence metrics
- **ControlMessage** - Start/stop/pause actions

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

### Test Setup (`tests/setup.ts`)
The test setup includes critical mocks:
- **MediaStream & mediaDevices** - Mock camera/mic access for interview tests
- **WebSocket** - Mock WebSocket for real-time communication tests
- **IntersectionObserver & ResizeObserver** - Browser API mocks
- **window.matchMedia** - Theme/media query mocks
- **MSW handlers** - API route mocks for auth, session, analytics

### Running Tests
```bash
# Vitest (unit, integration, component)
npm run test          # Watch mode
npm run test:run      # Run once
npm run test:ui       # Vitest UI
npx vitest path/to/test.test.ts  # Single file

# Playwright E2E
# Note: Uses baseURL: http://localhost:3007
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Playwright UI mode
npm run test:e2e:debug    # Debug mode
npm run test:e2e:headed   # Run with visible browser
npx playwright test --list  # List all tests

# Run all tests
npm run test:all          # Run both Vitest and Playwright
```

### Test Coverage
- **Vitest**: ~119 tests (unit, integration, component)
- **Playwright**: ~69 E2E tests
- **Total**: ~188 tests covering:
  - E2E: Full auth flow, dashboard, interview workflow, navigation
  - Integration: Auth API, session API
  - Component: Navbar, interview controls, confidence meter
  - Unit: Utilities, hooks

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...all]` | GET/POST | Better Auth handler |
| `/api/session/start` | POST | Create interview session |
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
- Middleware deprecation warning is expected (use `proxy.ts` pattern if needed)

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
- Dockerfile provided for Cloud Run/container deployment

### Testing Issues
- Playwright config uses `localhost:3007` as baseURL - ensure dev server matches or update config
- E2E tests may be blocked by auth registration issues - see `E2E-STATUS.md` for current status
- Use `DISABLE_AUTH` flag in middleware for local testing without authentication

### Known Bugs Fixed
1. **Theme Provider Crash** (`components/theme-provider.tsx:50`) - Fixed with `event.key?.toLowerCase()`
2. **Auth Registration 500 Error** - Fixed by adding `hashPassword` function with bcryptjs

## Additional Files

- **`AGENTS.md`** - Agentic coding guidelines and style conventions
- **`prd.md`** - Complete product requirements document
- **`E2E-STATUS.md`** - Current E2E testing implementation status
