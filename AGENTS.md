# AGENTS.md - Agentic Coding Guidelines

This file provides guidance for AI agents working in this repository.

## Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run dev:turbo        # Start with Turbopack
npm run build            # Production build
npm start                # Run production server

# Code Quality
npm run lint             # ESLint
npm run format           # Prettier (write mode)
npm run typecheck        # TypeScript check

# Testing (Vitest)
npm run test             # Watch mode
npm run test:run         # Run once
npx vitest path/to/test.test.ts          # Single test file
npx vitest path/to/test.test.ts -t "test name"  # Single test

# Database
npx prisma generate     # Generate Prisma Client
npx prisma db push     # Push schema to database
docker-compose up -d   # Start PostgreSQL
```

## Code Style Guidelines

### Imports

- Use absolute imports with `@/` prefix
- Order: external libs → internal components/hooks → types → utils

```typescript
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import type { InterviewSession } from "@/types/session"
```

### Types & Interfaces

- Use explicit types for function parameters
- Prefer interfaces for object shapes, types for unions
- Use `unknown` instead of `any`

### Naming Conventions

- **Files**: kebab-case (`use-websocket.ts`)
- **Components**: PascalCase (`VideoFeed.tsx`)
- **Hooks**: camelCase with `use` prefix (`useWebSocket`)
- **Constants**: SCREAMING_SNAKE_CASE
- **Boolean variables**: prefix with `is`, `has`, `should`

### React Patterns

- Use `"use client"` for client-side components
- Destructure props, use TypeScript for prop types
- Use `useCallback` for functions passed as props
- Add eslint-disable for acceptable dependency array omissions

### Error Handling

- Always wrap async operations in try/catch
- Use user-friendly error messages, log details server-side
- Return proper NextResponse errors with status codes

### Component Structure

```typescript
"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  title: string
  onSubmit: () => void
}

export function ComponentName({ title, onSubmit }: Props) {
  const [loading, setLoading] = useState(false)
  return <Button onClick={onSubmit}>{title}</Button>
}
```

### CSS/Tailwind

- Use Tailwind utility classes
- Use `cn()` from `@/lib/utils` for conditional classes

### Testing

- Test files: `{name}.test.ts` or `{name}.spec.ts`
- Unit tests in `tests/unit/`
- Integration tests in `tests/integration/`
- Component tests in `tests/components/`
- Use MSW for API mocking

### Database (Prisma)

- Use Prisma singleton from `@/lib/db`
- Models in `prisma/schema.prisma`
- App tables: InterviewSession, Transcript, ConfidenceLog, Report
- Auth tables: User, Account, Session, VerificationToken

### API Routes

- Use Next.js App Router pattern
- Return NextResponse with proper status codes

### Git Conventions

- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`
- Don't commit secrets
- Run `npm run typecheck && npm run lint` before committing

## Architecture Notes

- **Auth**: Use `useSession()` hook, not localStorage
- **Face Analysis**: Models go in `public/models/`
- **Environment**: See `.env.example` for required variables
