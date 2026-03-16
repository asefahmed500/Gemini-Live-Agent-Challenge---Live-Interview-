# 🤖 Live AI Interview Coach

A real-time multimodal AI agent that simulates technical job interviews using voice, video, and AI-powered feedback.

![Live AI Interview Coach](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![Gemini](https://img.shields.io/badge/Gemini-2.0-8E75B7?style=flat-square&logo=google)
![Better Auth](https://img.shields.io/badge/Better%20Auth-1.4-FF6B6B?style=flat-square)

## ✨ Features

### 🎤 Live Interview Experience
- **Real-time Voice Interaction**: Speak naturally with AI interviewer using Gemini Live API
- **Video Analysis**: Camera-based confidence tracking and eye contact monitoring
- **Speech Recognition**: Speech-to-text and text-to-speech for seamless conversation
- **Dynamic Questioning**: AI adapts questions based on your answers and interview type

### 📊 Smart Analytics
- **Confidence Tracking**: Real-time confidence score monitoring
- **Speech Analysis**: Filler word detection, speaking pace, and clarity scoring
- **Facial Expression Analysis**: Mood and engagement tracking via webcam
- **Detailed Reports**: AI-generated post-interview performance summaries

### 🔐 Secure Authentication
- **Better Auth**: Modern authentication with email/password
- **Session Management**: Secure cookie-based sessions
- **Protected Routes**: Dashboard and interviews are auth-protected

### 🎨 Beautiful UI
- **Modern Design**: Clean, responsive interface with dark theme
- **Real-time Updates**: Live confidence meters and transcript panels
- **Dashboard**: View interview history and performance trends

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (use Docker or managed service)
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/asefahmed500/Gemini-Live-Agent-Challenge---Live-Interview-.git
cd Gemini-Live-Agent-Challenge---Live-Interview-
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your values:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/live_interview"
GEMINI_API_KEY="your-gemini-api-key"
BETTER_AUTH_SECRET="min-32-char-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Set up the database**
```bash
# Using Docker (recommended for local development)
docker-compose up -d

# Push the schema to your database
npx prisma db push
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   └── interview/         # Live interview interface
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── interview/        # Interview-specific components
│   └── layout/           # Layout components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── prisma/               # Database schema
└── tests/                # Test files
```

## 🧪 Testing

```bash
# Run all tests
npm run test:all

# Vitest tests (unit, integration, component)
npm run test

# Playwright E2E tests
npm run test:e2e

# Run tests in UI mode
npm run test:ui
```

## 🏗️ Build for Production

```bash
npm run build
npm start
```

## 🌐 Deployment

### Vercel
1. Fork and push this repository to GitHub
2. Import to [Vercel](https://vercel.com/new)
3. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `GEMINI_API_KEY`: Your Gemini API key
   - `BETTER_AUTH_SECRET`: A secure 32+ character secret
   - `BETTER_AUTH_URL`: Your Vercel app URL
   - `NEXT_PUBLIC_APP_URL`: Your Vercel app URL

### Docker
```bash
docker build -t live-interview .
docker run -p 3000:3000 --env-file .env live-interview
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16.1 |
| **Language** | TypeScript 5.9 |
| **Styling** | Tailwind CSS v4 |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | Better Auth 1.4 |
| **AI** | Gemini 2.0 Flash Live |
| **Testing** | Vitest + Playwright |

## 📋 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/[...all]` | GET/POST | Authentication handler |
| `/api/session/start` | POST | Start new interview |
| `/api/session/chat` | POST | Chat with AI interviewer |
| `/api/session/end` | POST | End interview & generate report |
| `/api/sessions` | GET | List user sessions |
| `/api/analytics/[id]` | GET | Get session details |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built for the [Gemini Live Agent Challenge](https://ai.google.dev/competition/gemini-live-agent-challenge)
- Uses [Better Auth](https://www.better-auth.com) for authentication
- Powered by [Google Gemini 2.0 Flash](https://ai.google.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

---

**Note**: This is a hackathon project. Some features like real-time face analysis require additional model files that should be added to `/public/models/` for full functionality.
