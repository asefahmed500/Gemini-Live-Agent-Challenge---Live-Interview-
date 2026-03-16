# GEMINI.md

This file provides foundational instructions and project context for Gemini CLI when working in this repository.

## Project Overview

**Live AI Interview Coach** is a real-time multimodal AI application designed to simulate technical job interviews. It leverages the **Gemini 2.0 Flash Live API** for bidirectional voice and video streaming, providing users with live feedback on their performance.

### Core Technology Stack
- **Framework**: Next.js 16 (App Router) with React 19 and Turbopack.
- **AI**: Gemini 2.0 Flash (Live & Text) via Google Generative AI SDK.
- **Authentication**: Better Auth 1.5 (Email/Password & Google OAuth).
- **Database**: Prisma 5 with PostgreSQL (running in Docker).
- **Real-time**: WebSockets for streaming audio/video and receiving AI responses.
- **Styling**: Tailwind CSS v4 with the **Okech theme** (high-contrast dark mode).
- **Testing**: Vitest (Unit/Integration) and Playwright (E2E) with 180+ tests.

## Development & Lifecycle

### Prerequisites
- **Node.js**: v20+
- **Docker**: For running PostgreSQL and PG Admin.
- **Environment Variables**: Copy `.env.example` to `.env` and fill in `GEMINI_API_KEY`, `DATABASE_URL`, and `BETTER_AUTH_SECRET`.

### Key Commands

| Action | Command |
|--------|---------|
| **Install** | `npm install` |
| **Dev (All)** | `npm run dev:all` (Starts Next.js + WebSocket server) |
| **Dev (Next.js)** | `npm run dev` |
| **Dev (WS)** | `npm run ws:dev` |
| **Build** | `npm run build` |
| **Test (All)** | `npm run test:all` |
| **Test (Unit)** | `npm run test:run` |
| **Test (E2E)** | `npm run test:e2e` |
| **DB Push** | `npx prisma db push` |
| **DB Studio** | `npx prisma studio` |
| **Lint/Format** | `npm run lint` / `npm run format` |

## Architecture & Conventions

### Directory Structure
- `app/`: Next.js App Router pages and API routes.
- `components/`: UI components (Okech/Shadcn theme in `ui/`, domain-specific in `interview/`, `dashboard/`).
- `hooks/`: Custom React hooks for media, WebSockets, and AI state.
- `lib/`: Server-side utilities, Prisma client, and Gemini integration.
- `server/`: WebSocket server implementation (`ws-server.ts`).
- `tests/`: Comprehensive test suite (Unit, Integration, E2E).
- `types/`: Shared TypeScript interfaces and types.

### Development Guidelines
- **AI Integration**: Logic for Gemini is centralized in `lib/gemini.ts`. Real-time streaming is handled via the WebSocket server in `server/ws-server.ts`.
- **Authentication**: Routes are protected via middleware. Use `lib/auth-client.ts` for client-side auth and `lib/auth.ts` for server-side.
- **Database**: Always run `npx prisma generate` after schema changes. Use `db.ts` singleton for Prisma access.
- **UI/UX**: Adhere to the Okech theme tokens (electric accents on deep dark backgrounds). Use Lucide icons.
- **Testing**: All new features **must** include corresponding tests in the `tests/` directory. Aim to maintain the existing high coverage (~180 tests).
- **Next.js 16 Patterns**:
    - `params` in dynamic routes are Promises: `const { id } = await params`.
    - Wrap `useSearchParams` in `<Suspense>`.
    - Use `output: 'standalone'` for production builds.

### Safety & Security
- Never commit `.env` files.
- Ensure API keys are accessed via `process.env`.
- Better Auth sessions expire in 7 days by default.

## Known Constraints & Workarounds
- **WebSocket in Next.js**: Next.js does not natively support WebSockets in Route Handlers. Use the standalone `server/ws-server.ts` for local development and a compatible environment (like Cloud Run or a dedicated Node.js server) for deployment.
- **Better Auth Registration**: Requires a custom `hashPassword` function with `bcryptjs` as configured in `lib/auth.ts`.
