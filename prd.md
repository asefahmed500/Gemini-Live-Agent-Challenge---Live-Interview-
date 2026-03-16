# 📄 Product Requirements Document
# Live AI Interview Coach

> **Version:** 1.0 — Hackathon MVP  
> **Stack:** Next.js 15 · Gemini Live API · Google ADK · Better Auth · Okech UI  
> **Deployment:** Google Cloud Run + Vertex AI  
> **Challenge:** Gemini Live Agent Challenge

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [Target Users](#3-target-users)
4. [Core Features](#4-core-features)
5. [Tech Stack](#5-tech-stack)
6. [System Design & Architecture](#6-system-design--architecture)
7. [Project Folder Structure](#7-project-folder-structure)
8. [Authentication — Better Auth](#8-authentication--better-auth)
9. [UI Design System — Okech Theme](#9-ui-design-system--okech-theme)
10. [Gemini Live API Integration](#10-gemini-live-api-integration)
11. [Google ADK Agent Design](#11-google-adk-agent-design)
12. [API Design](#12-api-design)
13. [Database Schema](#13-database-schema)
14. [UI Pages & Components](#14-ui-pages--components)
15. [Non-Functional Requirements](#15-non-functional-requirements)
16. [Hackathon Deliverables](#16-hackathon-deliverables)
17. [Demo Scenario](#17-demo-scenario)
18. [Roadmap — Future Features](#18-roadmap--future-features)

---

## 1. Product Overview

**Live AI Interview Coach** is a real-time multimodal AI agent that simulates technical job interviews.

The system:
- Listens via microphone (audio stream)
- Observes the user via webcam (vision stream)
- Responds with natural AI voice questions and follow-ups
- Analyzes confidence, eye contact, speech clarity, and technical depth — live

Unlike traditional chatbots or pre-recorded mock interviews, this uses **Gemini Live API** for true streaming bidirectional interaction powered by a **Google ADK** orchestrated agent pipeline.

---

## 2. Goals & Success Metrics

### Primary Goal

Build a fully working **multimodal real-time AI interviewer** that demonstrates the Gemini Live API capabilities end-to-end.

### Secondary Goals

| Goal | Description |
|------|-------------|
| Multimodal interaction | Voice + Vision simultaneously |
| Live feedback | Confidence scores update in real-time |
| Interruptible AI | Natural conversation flow, AI can interrupt |
| Auth system | Secure sessions via Better Auth |
| Cloud deployment | Running live on Google Cloud Run |

### Success Metrics

| Metric | Target |
|--------|--------|
| AI response latency | < 1.5 seconds |
| Session stability | Zero crashes across 5-minute demo |
| Vision analysis accuracy | Confidence score updates every 2s |
| Auth flow | Login → Interview in < 30 seconds |
| Demo impression | Judges see real streaming AI interaction |

---

## 3. Target Users

### Primary Users
- Software developers preparing for technical interviews
- Students in CS programs or bootcamps
- Job seekers practicing behavioral rounds

### Secondary Users
- HR teams running AI-assisted screening
- Coding bootcamp instructors
- Career coaches

---

## 4. Core Features

### 4.1 Live AI Interview Session

A real-time, voice-driven interview session powered by Gemini Live API.

**User Flow:**
```
User grants mic + camera permissions
        ↓
AI greets user via voice
        ↓
AI asks question → User answers verbally
        ↓
AI listens, analyzes, follows up or interrupts
        ↓
Session ends → Report generated
```

**Capabilities:**
- Streaming audio input (microphone)
- Streaming video frames (webcam)
- AI voice output (Gemini TTS)
- Barge-in / interruption support
- Session context memory across turns

---

### 4.2 Vision Analysis (Camera Feed)

Continuous real-time analysis of the webcam stream.

| Metric | Description |
|--------|-------------|
| Eye Contact | Tracks gaze direction toward screen |
| Posture | Detects slouching or forward lean |
| Facial Confidence | Reads micro-expressions, tension |
| Engagement Level | Overall presence score |

**Live Output UI:**
```
┌────────────────────────────┐
│  Confidence Score:  72%    │
│  Eye Contact:       Good   │
│  Posture:           Fair   │
│  Speaking Clarity:  High   │
└────────────────────────────┘
```

---

### 4.3 Voice Conversation Engine

AI conducts natural spoken conversations using Gemini Live's native audio capabilities.

**Key behaviors:**
- AI speaks questions aloud
- AI listens and understands spoken answers
- AI interrupts with follow-up if answer is unclear or interesting
- AI adapts question depth based on user's answer quality

**Example Exchange:**

> **AI:** "Can you walk me through how you'd design a distributed rate limiter?"
>
> *User begins answering...*
>
> **AI (interrupts):** "Interesting — you mentioned Redis. How would you handle clock drift across nodes?"

---

### 4.4 Coding Question Mode

AI presents a coding problem visually on screen and asks the user to explain their approach verbally.

**Problem Display:**
```
┌──────────────────────────────────────┐
│  Problem: Reverse a Linked List      │
│  Difficulty: Medium                  │
│  Language: Your choice               │
│                                      │
│  Explain your approach step by step  │
└──────────────────────────────────────┘
```

AI evaluates:
- Algorithmic reasoning clarity
- Time/space complexity understanding
- Edge case awareness

---

### 4.5 Post-Interview Analytics Dashboard

After session ends, a full performance report is generated.

| Metric | Weight | Description |
|--------|--------|-------------|
| Confidence Score | 25% | Overall speaking confidence |
| Speech Clarity | 20% | Filler word detection, pace |
| Eye Contact | 20% | Camera analysis average |
| Technical Depth | 35% | Answer completeness, accuracy |

Report also includes:
- Transcript of the full interview
- Per-question breakdown
- Improvement suggestions from AI
- Historical trend chart (if prior sessions exist)

---

## 5. Tech Stack

### Frontend

| Tool | Purpose |
|------|---------|
| Next.js 15 (App Router) | Full-stack framework |
| React 19 | Component layer |
| TailwindCSS v4 | Styling |
| Okech Design System | Custom UI theme (see Section 9) |
| WebRTC | Camera and microphone streaming |
| Web Audio API | Audio capture and waveform visualization |
| Framer Motion | Animations, transitions |

---

### Backend (Next.js API Routes)

| Tool | Purpose |
|------|---------|
| Next.js Route Handlers | API endpoints |
| Better Auth | Authentication (see Section 8) |
| Prisma ORM | Database access layer |
| Zod | Schema validation |
| Google ADK | Agent orchestration (see Section 11) |

---

### AI Layer

| Tool | Purpose |
|------|---------|
| Gemini 2.0 Flash Live | Real-time multimodal streaming |
| Gemini Vision | Frame-by-frame webcam analysis |
| Gemini TTS | AI voice output |
| Google ADK | Multi-agent orchestration pipeline |
| Vertex AI | Hosted model endpoint on GCP |

---

### Cloud Infrastructure (Google Cloud)

| Service | Purpose |
|---------|---------|
| Cloud Run | App deployment (containerized Next.js) |
| Vertex AI | Gemini model endpoint |
| Firestore | Session metadata, analytics storage |
| Cloud Storage | Session recordings (optional) |
| Secret Manager | API keys, auth secrets |
| Artifact Registry | Docker image storage |

---

## 6. System Design & Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BROWSER (Client)                           │
│                                                                     │
│  ┌──────────┐   ┌──────────┐   ┌──────────────┐   ┌────────────┐  │
│  │ Camera   │   │   Mic    │   │  Interview   │   │ Analytics  │  │
│  │  Feed    │   │  Stream  │   │    Panel     │   │ Dashboard  │  │
│  └────┬─────┘   └────┬─────┘   └──────┬───────┘   └─────┬──────┘  │
│       │              │                │                   │         │
│       └──────────────┴────────────────┘                   │         │
│                        │ WebRTC / WebSocket               │         │
└────────────────────────┼──────────────────────────────────┼─────────┘
                         │                                   │
┌────────────────────────▼──────────────────────────────────▼─────────┐
│                      NEXT.JS SERVER (Cloud Run)                      │
│                                                                      │
│  ┌─────────────────┐    ┌──────────────────┐    ┌────────────────┐  │
│  │  Better Auth    │    │   API Routes     │    │  ADK Agent     │  │
│  │  Middleware     │    │  /api/session    │    │  Orchestrator  │  │
│  │  Session Guard  │    │  /api/live-agent │    │  (see §11)     │  │
│  └────────┬────────┘    │  /api/analytics  │    └───────┬────────┘  │
│           │             └────────┬─────────┘            │           │
│           │                      │                       │           │
│    ┌──────▼──────┐        ┌──────▼───────┐    ┌─────────▼────────┐  │
│    │  Prisma ORM │        │ Gemini Live  │    │  Vision Analyzer │  │
│    │  (Database) │        │   Client     │    │  (Frame Chunks)  │  │
│    └──────┬──────┘        └──────┬───────┘    └─────────┬────────┘  │
│           │                      │                       │           │
└───────────┼──────────────────────┼───────────────────────┼───────────┘
            │                      │                       │
┌───────────▼──────┐   ┌───────────▼────────────────────────▼────────┐
│   PostgreSQL     │   │              GOOGLE CLOUD AI                 │
│   (Neon / GCP    │   │                                              │
│   Cloud SQL)     │   │  ┌────────────────┐  ┌─────────────────┐   │
│                  │   │  │ Vertex AI      │  │  Gemini 2.0     │   │
│   Tables:        │   │  │ Gemini Live    │  │  Flash (Live)   │   │
│   - users        │   │  │ Endpoint       │  │  Streaming      │   │
│   - sessions     │   │  └────────────────┘  └─────────────────┘   │
│   - analytics    │   │                                              │
│   - transcripts  │   │  ┌────────────────┐  ┌─────────────────┐   │
└──────────────────┘   │  │  Firestore     │  │ Cloud Storage   │   │
                       │  │  (Session KV)  │  │ (Recordings)    │   │
                       │  └────────────────┘  └─────────────────┘   │
                       └──────────────────────────────────────────────┘
```

---

### Data Flow — Live Interview Session

```
1. User clicks "Start Interview"
   └─→ POST /api/session/start
       └─→ Creates session record in DB
           └─→ Returns session_id + WebSocket token

2. Client opens WebSocket connection
   └─→ /api/live-agent?session_id=xxx
       └─→ ADK Agent initializes Gemini Live stream

3. Streaming Loop (bidirectional):
   ┌─────────────────────────────────────────────┐
   │  Client → Server: audio chunk (every 100ms) │
   │  Client → Server: video frame (every 500ms) │
   │  Server → Gemini: multimodal stream         │
   │  Gemini → Server: audio response chunk      │
   │  Server → Client: audio playback chunk      │
   │  Server → Client: confidence score update   │
   └─────────────────────────────────────────────┘

4. User clicks "End Interview"
   └─→ POST /api/session/end
       └─→ ADK Analytics Agent generates report
           └─→ Stored in DB
               └─→ Redirect to /dashboard/[session_id]
```

---

### WebSocket Message Protocol

```typescript
// Client → Server
type ClientMessage =
  | { type: "audio_chunk";    data: ArrayBuffer; timestamp: number }
  | { type: "video_frame";    data: string;      timestamp: number } // base64
  | { type: "end_session" }
  | { type: "ping" }

// Server → Client
type ServerMessage =
  | { type: "ai_audio_chunk"; data: ArrayBuffer }
  | { type: "transcript";     text: string; speaker: "ai" | "user" }
  | { type: "confidence";     score: number; breakdown: ConfidenceBreakdown }
  | { type: "session_ended";  report_id: string }
  | { type: "error";          message: string }
  | { type: "pong" }
```

---

## 7. Project Folder Structure

```
live-ai-interview-coach/
│
├── app/                              # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx              # Better Auth login page
│   │   └── register/
│   │       └── page.tsx              # Better Auth register page
│   │
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Analytics dashboard
│   │   └── dashboard/[session_id]/
│   │       └── page.tsx              # Single session report
│   │
│   ├── interview/
│   │   └── page.tsx                  # Live interview page
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...all]/
│   │   │       └── route.ts          # Better Auth catch-all handler
│   │   ├── session/
│   │   │   ├── start/route.ts        # POST — create session
│   │   │   └── end/route.ts          # POST — end + generate report
│   │   ├── live-agent/
│   │   │   └── route.ts              # WebSocket handler — Gemini Live
│   │   └── analytics/
│   │       └── [session_id]/route.ts # GET — session analytics
│   │
│   ├── layout.tsx                    # Root layout (Okech theme provider)
│   └── page.tsx                      # Landing page
│
├── components/
│   ├── ui/                           # Okech base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   └── avatar.tsx
│   │
│   ├── interview/
│   │   ├── VideoFeed.tsx             # Webcam stream display
│   │   ├── AudioWaveform.tsx         # Mic waveform visualizer
│   │   ├── ConfidenceMeter.tsx       # Live score display
│   │   ├── TranscriptPanel.tsx       # Live transcript scroll
│   │   ├── CodingPanel.tsx           # Coding problem display
│   │   └── InterviewControls.tsx     # Start/pause/end buttons
│   │
│   ├── dashboard/
│   │   ├── SessionCard.tsx           # Past session summary
│   │   ├── AnalyticsChart.tsx        # Improvement trend chart
│   │   └── ScoreBreakdown.tsx        # Per-metric breakdown
│   │
│   └── layout/
│       ├── Navbar.tsx
│       └── Footer.tsx
│
├── lib/
│   ├── auth.ts                       # Better Auth server config
│   ├── auth-client.ts                # Better Auth client config
│   ├── gemini.ts                     # Gemini Live client setup
│   ├── adk-agent.ts                  # Google ADK agent definitions
│   ├── audio-processor.ts            # Audio stream utilities
│   ├── vision-analyzer.ts            # Frame analysis utilities
│   └── db.ts                         # Prisma client singleton
│
├── prisma/
│   └── schema.prisma                 # Database schema
│
├── hooks/
│   ├── useWebSocket.ts               # WS connection manager
│   ├── useMediaStream.ts             # Camera + mic access
│   ├── useAudioPlayback.ts           # AI voice playback
│   └── useConfidenceScore.ts         # Live score state
│
├── types/
│   ├── session.ts
│   ├── analytics.ts
│   └── messages.ts
│
├── public/
│   └── assets/
│
├── .env.local                        # Environment variables
├── Dockerfile                        # Cloud Run container
├── cloudbuild.yaml                   # GCP CI/CD pipeline
├── docker-compose.yml                # Local dev
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 8. Authentication — Better Auth

[Better Auth](https://www.better-auth.com) is used as the authentication layer. It is a TypeScript-native auth framework with built-in session management and zero vendor lock-in.

### Setup

```bash
npm install better-auth
```

### Server Config — `lib/auth.ts`

```typescript
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { db } from "./db"

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // disabled for hackathon speed
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // refresh daily
  },
})

export type Session = typeof auth.$Infer.Session
```

### Client Config — `lib/auth-client.ts`

```typescript
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
})

export const {
  signIn,
  signOut,
  signUp,
  useSession,
} = authClient
```

### Auth API Route — `app/api/auth/[...all]/route.ts`

```typescript
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { GET, POST } = toNextJsHandler(auth)
```

### Middleware — Route Protection

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "better-auth/next-js"
import { auth } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const session = await getSessionFromRequest(request, auth)

  const protectedRoutes = ["/interview", "/dashboard"]
  const isProtected = protectedRoutes.some(r =>
    request.nextUrl.pathname.startsWith(r)
  )

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}
```

### Auth-Required Prisma Models

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      BetterAuthSession[]
  accounts      Account[]
  interviewSessions InterviewSession[]
}

model BetterAuthSession {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id                    String  @id @default(cuid())
  userId                String
  accountId             String
  providerId            String
  accessToken           String?
  refreshToken          String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  idToken               String?
  password              String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 9. UI Design System — Okech Theme

The Okech theme is a high-contrast, deep-dark design language with electric accent colors. It is inspired by terminal aesthetics merged with modern SaaS UI.

### Design Tokens

```css
/* globals.css — Okech Theme */

:root {
  /* Background scale */
  --bg-base:       #0A0A0F;   /* deep near-black */
  --bg-surface:    #111118;   /* card backgrounds */
  --bg-elevated:   #1A1A24;   /* modals, overlays */
  --bg-border:     #2A2A3A;   /* borders */

  /* Brand accent */
  --accent-primary:  #6C63FF;  /* electric violet */
  --accent-secondary: #00D4AA; /* teal green */
  --accent-danger:   #FF4C6A;  /* coral red */
  --accent-warning:  #FFB547;  /* amber */

  /* Typography */
  --text-primary:    #F0F0FF;
  --text-secondary:  #9090AA;
  --text-muted:      #50506A;

  /* UI radii */
  --radius-sm:  6px;
  --radius-md:  10px;
  --radius-lg:  16px;
  --radius-xl:  24px;

  /* Glow effects */
  --glow-primary:   0 0 20px rgba(108, 99, 255, 0.35);
  --glow-secondary: 0 0 20px rgba(0, 212, 170, 0.35);
}
```

### Tailwind Config Extension

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        okech: {
          base:      "#0A0A0F",
          surface:   "#111118",
          elevated:  "#1A1A24",
          border:    "#2A2A3A",
          primary:   "#6C63FF",
          secondary: "#00D4AA",
          danger:    "#FF4C6A",
          warning:   "#FFB547",
          text:      "#F0F0FF",
          muted:     "#9090AA",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow:     "0 0 20px rgba(108, 99, 255, 0.35)",
        "glow-teal": "0 0 20px rgba(0, 212, 170, 0.35)",
      }
    }
  }
}
```

### Key Component Styles

```typescript
// components/ui/button.tsx — Okech Button
const buttonVariants = {
  primary: "bg-okech-primary hover:bg-okech-primary/90 text-white shadow-glow",
  secondary: "bg-okech-surface border border-okech-border hover:border-okech-primary text-okech-text",
  danger: "bg-okech-danger/20 border border-okech-danger text-okech-danger hover:bg-okech-danger/30",
  ghost: "text-okech-muted hover:text-okech-text hover:bg-okech-elevated",
}
```

### Page Visual Language

| Element | Style |
|---------|-------|
| Page background | `bg-okech-base` |
| Cards / Panels | `bg-okech-surface border border-okech-border rounded-xl` |
| Active states | `border-okech-primary shadow-glow` |
| Confidence score bar | Gradient: `okech-danger → okech-warning → okech-secondary` |
| AI speaking indicator | Animated pulsing ring in `okech-primary` |
| Waveform | `okech-secondary` (#00D4AA) bars |

---

## 10. Gemini Live API Integration

### Setup

```typescript
// lib/gemini.ts
import { GoogleGenerativeAI, LiveServerMessage } from "@google/generative-ai"

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const INTERVIEW_SYSTEM_PROMPT = `
You are a senior software engineer conducting a live technical job interview.

Your behavior:
- Ask one clear question at a time
- Listen to the full answer before asking the next
- Interrupt naturally when an answer is interesting or incomplete
- Ask targeted follow-up questions to probe deeper
- Maintain a professional but conversational tone
- Vary question types: behavioral, technical, system design, coding explanation

Start the interview by greeting the candidate and asking them to briefly introduce themselves.
`
```

### Live Session Handler — `app/api/live-agent/route.ts`

```typescript
import { NextRequest } from "next/server"
import { genAI, INTERVIEW_SYSTEM_PROMPT } from "@/lib/gemini"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  // Upgrade to WebSocket
  const { socket, response } = await (req as any).socket.server.upgrade(req)

  const session = await genAI
    .getGenerativeModel({ model: "gemini-2.0-flash-live-001" })
    .startLiveSession({
      config: {
        systemInstruction: INTERVIEW_SYSTEM_PROMPT,
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Puck" }
          }
        }
      }
    })

  // Relay audio chunks from client to Gemini
  socket.on("message", async (data: Buffer) => {
    const message = JSON.parse(data.toString())

    if (message.type === "audio_chunk") {
      await session.send({
        realtimeInput: {
          audio: {
            data: message.data,
            mimeType: "audio/pcm;rate=16000"
          }
        }
      })
    }

    if (message.type === "video_frame") {
      await session.send({
        realtimeInput: {
          video: {
            data: message.data,
            mimeType: "image/jpeg"
          }
        }
      })
    }
  })

  // Relay Gemini responses back to client
  for await (const chunk of session) {
    if (chunk.serverContent?.modelTurn?.parts) {
      for (const part of chunk.serverContent.modelTurn.parts) {
        if (part.inlineData?.mimeType?.startsWith("audio/")) {
          socket.send(JSON.stringify({
            type: "ai_audio_chunk",
            data: part.inlineData.data
          }))
        }
        if (part.text) {
          socket.send(JSON.stringify({
            type: "transcript",
            text: part.text,
            speaker: "ai"
          }))
        }
      }
    }
  }

  return response
}
```

---

## 11. Google ADK Agent Design

Google ADK (Agent Development Kit) is used to define the multi-agent pipeline that orchestrates the interview session.

### Agent Topology

```
                    ┌─────────────────────┐
                    │   OrchestratorAgent  │
                    │   (root coordinator) │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
  ┌───────▼──────┐   ┌────────▼────────┐  ┌────────▼────────┐
  │ InterviewerA.│   │  VisionAnalyst  │  │ AnalyticsAgent  │
  │ (Gemini Live)│   │  (Frame scores) │  │ (Post-session)  │
  └──────────────┘   └─────────────────┘  └─────────────────┘
```

### Agent Definitions — `lib/adk-agent.ts`

```typescript
import { Agent, tool, LlmAgent } from "@google/adk"

// Tool: score a video frame for confidence signals
const analyzeFrameTool = tool({
  name: "analyze_frame",
  description: "Analyze a webcam frame for eye contact, posture, and confidence",
  parameters: {
    frame_base64: { type: "string", description: "Base64 encoded JPEG frame" }
  },
  handler: async ({ frame_base64 }) => {
    // Call Gemini Vision to score the frame
    const result = await scoreFrame(frame_base64)
    return result
  }
})

// Tool: generate final analytics report
const generateReportTool = tool({
  name: "generate_report",
  description: "Generate a post-interview performance report from session data",
  parameters: {
    transcript: { type: "string" },
    confidence_scores: { type: "array" },
    session_id: { type: "string" }
  },
  handler: async ({ transcript, confidence_scores, session_id }) => {
    // Call Gemini to analyze transcript + scores
    return await buildReport(transcript, confidence_scores, session_id)
  }
})

// Vision Analyst Sub-Agent
export const visionAnalystAgent = new LlmAgent({
  name: "VisionAnalystAgent",
  model: "gemini-2.0-flash-001",
  description: "Analyzes webcam frames to score confidence, eye contact, posture",
  tools: [analyzeFrameTool],
})

// Analytics Sub-Agent
export const analyticsAgent = new LlmAgent({
  name: "AnalyticsAgent",
  model: "gemini-2.0-flash-001",
  description: "Generates final interview performance report",
  tools: [generateReportTool],
})

// Root Orchestrator
export const orchestratorAgent = new Agent({
  name: "InterviewOrchestrator",
  description: "Coordinates the live interview session across sub-agents",
  subAgents: [visionAnalystAgent, analyticsAgent],
})
```

---

## 12. API Design

### `POST /api/session/start`

Creates a new interview session.

**Request:**
```json
{ "interview_type": "technical" | "behavioral" | "system_design" }
```

**Response:**
```json
{
  "session_id": "clx_abc123",
  "ws_token": "eyJ...",
  "expires_at": "2025-01-01T00:30:00Z"
}
```

---

### `GET /api/live-agent` (WebSocket Upgrade)

Bidirectional WebSocket for the live interview stream.

**Client sends:** audio chunks, video frames, end signal  
**Server sends:** AI audio, transcripts, confidence scores

---

### `POST /api/session/end`

Ends the session and triggers report generation.

**Request:**
```json
{ "session_id": "clx_abc123" }
```

**Response:**
```json
{
  "report_id": "rep_xyz456",
  "redirect": "/dashboard/clx_abc123"
}
```

---

### `GET /api/analytics/[session_id]`

Returns the complete analytics report for a session.

**Response:**
```json
{
  "session_id": "clx_abc123",
  "duration_seconds": 420,
  "overall_score": 74,
  "breakdown": {
    "confidence": 72,
    "speech_clarity": 68,
    "eye_contact": 80,
    "technical_depth": 76
  },
  "transcript": [...],
  "suggestions": [
    "Reduce use of filler words",
    "Maintain more consistent eye contact",
    "Elaborate on time complexity in answers"
  ]
}
```

---

## 13. Database Schema

### `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// --- Better Auth models (see Section 8) ---
model User { ... }
model BetterAuthSession { ... }
model Account { ... }

// --- App models ---

model InterviewSession {
  id              String   @id @default(cuid())
  userId          String
  interviewType   String   @default("technical")
  startedAt       DateTime @default(now())
  endedAt         DateTime?
  durationSeconds Int?

  // Scores (0–100)
  overallScore      Int?
  confidenceScore   Int?
  speechClarity     Int?
  eyeContactScore   Int?
  technicalDepth    Int?

  transcript        Transcript[]
  confidenceLogs    ConfidenceLog[]
  report            Report?

  user              User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Transcript {
  id        String   @id @default(cuid())
  sessionId String
  speaker   String   // "ai" | "user"
  text      String
  timestamp DateTime @default(now())
  session   InterviewSession @relation(fields: [sessionId], references: [id])
}

model ConfidenceLog {
  id          String   @id @default(cuid())
  sessionId   String
  timestamp   DateTime @default(now())
  score       Int
  eyeContact  Int
  posture     Int
  engagement  Int
  session     InterviewSession @relation(fields: [sessionId], references: [id])
}

model Report {
  id          String   @id @default(cuid())
  sessionId   String   @unique
  generatedAt DateTime @default(now())
  summary     String
  suggestions Json     // string[]
  session     InterviewSession @relation(fields: [sessionId], references: [id])
}
```

---

## 14. UI Pages & Components

### Landing Page (`/`)

```
┌────────────────────────────────────────────────────┐
│  NAVBAR: Logo | Dashboard | Sign In                │
├────────────────────────────────────────────────────┤
│                                                    │
│        AI INTERVIEW COACH                          │
│   Real-time multimodal interview practice          │
│                                                    │
│   [ 🎤 Start Interview ]  [ View Demo ]            │
│                                                    │
│   ──────────────────────────────────────────────   │
│   📹 Camera Analysis  🎯 Live Feedback  🤖 Gemini   │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

### Interview Page (`/interview`)

```
┌──────────────────────────────────────────────────────────────┐
│ NAVBAR: Session timer 12:43  [End Interview]                 │
├──────────────────────┬───────────────────────────────────────┤
│                      │                                       │
│   📹 CAMERA FEED     │  🤖 AI TRANSCRIPT                     │
│   ┌──────────────┐   │  ┌─────────────────────────────────┐  │
│   │              │   │  │ AI: "Tell me about yourself."   │  │
│   │  [webcam]    │   │  │ You: "I'm a backend engineer..." │  │
│   │              │   │  │ AI: "Interesting. What's your   │  │
│   └──────────────┘   │  │      biggest technical win?"    │  │
│                      │  └─────────────────────────────────┘  │
│   🎵 WAVEFORM        │                                       │
│   ▁▂▄▆▇▅▃▁▂▄▆       │  📊 LIVE METRICS                     │
│                      │  Confidence:   ██████░░░  72%        │
│                      │  Eye Contact:  ████████░  80%        │
│                      │  Clarity:      ██████░░░  68%        │
│                      │                                       │
└──────────────────────┴───────────────────────────────────────┘
```

---

### Dashboard Page (`/dashboard`)

```
┌────────────────────────────────────────────────────────────────┐
│ YOUR INTERVIEW HISTORY                          [New Session]  │
├────────────────────────────────────────────────────────────────┤
│  📈 IMPROVEMENT TREND                                          │
│  [Line chart: confidence score across sessions]                │
├────────────────────────────────────────────────────────────────┤
│  PAST SESSIONS                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Jan 12 · Technical Interview · 7 min     Score: 74/100  │  │
│  │ Jan 10 · Behavioral Interview · 5 min    Score: 68/100  │  │
│  │ Jan 08 · System Design · 12 min          Score: 81/100  │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## 15. Non-Functional Requirements

### Performance

| Requirement | Target |
|-------------|--------|
| AI first response latency | < 1.5 seconds |
| Audio chunk relay delay | < 100ms |
| Video frame analysis interval | Every 2 seconds |
| Confidence score UI update | Every 2 seconds |
| Page load (interview page) | < 2 seconds |

### Reliability

| Scenario | Handling |
|----------|----------|
| Microphone permission denied | Clear error UI, retry button |
| WebSocket disconnect | Auto-reconnect with exponential backoff |
| Gemini API timeout | Graceful fallback message, session preserved |
| Camera unavailable | Audio-only mode continues |

### Security

- All routes protected by Better Auth middleware
- API keys stored in Google Secret Manager
- WebSocket tokens are short-lived (30 min)
- No raw video/audio stored permanently by default

---

## 16. Hackathon Deliverables

| Asset | Description |
|-------|-------------|
| GitHub Repository | Public repo with README, architecture diagram, setup instructions |
| Architecture Diagram | Full system design (see Section 6) |
| Demo Video | 4-minute walkthrough showing live multimodal interaction |
| Cloud Deployment | Live URL on Cloud Run with Vertex AI integration |
| Dockerfile | Production-ready container config |

### Environment Variables Required

```bash
# .env.local

# Gemini / Google AI
GEMINI_API_KEY=
GOOGLE_CLOUD_PROJECT=
GOOGLE_CLOUD_REGION=us-central1

# Google OAuth (for Better Auth social login)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=https://your-app.run.app

# Database
DATABASE_URL=postgresql://...

# App
NEXT_PUBLIC_APP_URL=https://your-app.run.app
```

---

## 17. Demo Scenario

For the 4-minute hackathon demo video:

| Timestamp | Scene |
|-----------|-------|
| 0:00–0:30 | Landing page walkthrough, click "Start Interview" |
| 0:30–0:50 | Login with Google via Better Auth |
| 0:50–1:10 | Camera + mic permissions granted, session starts |
| 1:10–1:30 | AI greets via voice, asks first question (system design) |
| 1:30–2:30 | Developer answers verbally, AI interrupts with follow-up |
| 2:30–3:00 | Show confidence meter updating live in sidebar |
| 3:00–3:30 | AI presents coding problem, user explains verbally |
| 3:30–4:00 | Session ends, analytics report shown on dashboard |

---

## 18. Roadmap — Future Features

| Feature | Priority | Notes |
|---------|----------|-------|
| Resume analysis | High | Upload PDF, AI tailors questions to experience |
| Company-specific mode | High | FAANG / startup specific question banks |
| Emotion detection | Medium | Deeper facial analysis via Vision API |
| AI coding whiteboard | Medium | Collaborative code editor with AI feedback |
| Peer comparison | Low | Anonymous score benchmarking |
| Mobile app | Low | React Native version |
| Slack/Calendar integration | Low | Schedule mock interviews |

---

*Document authored for the Gemini Live Agent Hackathon Challenge. Version 1.0.*