# AITA Verdict: Panel Mode

> 4 AI judges debate your situation. A Chief Judge delivers the final ruling.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TanStack](https://img.shields.io/badge/TanStack-Start-ff4154)](https://tanstack.com/start)
[![Convex](https://img.shields.io/badge/Convex-Backend-8b5cf6)](https://convex.dev/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-f38020?logo=cloudflare)](https://workers.cloudflare.com/)

---

## The Concept

*"I asked 4 AIs if I was the asshole. They disagreed."*

Submit your interpersonal conflict and watch as 4 AI judges with distinct personalities analyze your situation in parallel. Then a Chief Judge synthesizes their arguments and delivers the final verdict.

---

## The Panel

| Judge | Personality | Approach |
|-------|-------------|----------|
| **Claude** | Empathetic | Considers emotional context |
| **GPT** | Logical | Focuses on facts and fairness |
| **Gemini** | Practical | Seeks real-world solutions |
| **Grok** | Skeptical | Questions motives |
| **Chief** | Synthesizer | Weighs all arguments |

---

## Verdicts

| Code | Meaning |
|------|---------|
| **YTA** | You're The A-hole |
| **NTA** | Not The A-hole |
| **ESH** | Everyone Sucks Here |
| **NAH** | No A-holes Here |
| **INFO** | Need More Info |

---

## Tech Stack

- **Framework**: TanStack Start (React + SSR)
- **Backend**: Convex (real-time database + serverless)
- **Auth**: WorkOS AuthKit
- **LLM**: OpenRouter (Claude, GPT, Gemini, Grok)
- **UI**: shadcn/ui + Tailwind CSS v4
- **Edge**: Cloudflare Workers

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Convex account
- WorkOS account
- OpenRouter API key

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/aita.git
cd aita

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local
```

### Environment Variables

Create `.env.local` with:

```env
# Convex
CONVEX_DEPLOYMENT=dev:your-deployment
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# WorkOS Auth
WORKOS_CLIENT_ID=client_xxx
WORKOS_API_KEY=sk_test_xxx
WORKOS_REDIRECT_URI=http://localhost:3000/api/auth/callback
WORKOS_COOKIE_PASSWORD=your-32-character-secret-key-here

# Client-side WorkOS
VITE_WORKOS_CLIENT_ID=client_xxx
VITE_WORKOS_REDIRECT_URI=http://localhost:3000/api/auth/callback

# OpenRouter
OPENROUTER_API_KEY=sk-or-v1-xxx
```

### Development

```bash
# Terminal 1: Convex backend
npx convex dev

# Terminal 2: Vite frontend
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server on port 3000 |
| `pnpm build` | Build for production |
| `pnpm test` | Run tests |
| `pnpm lint` | Lint with Biome |
| `pnpm deploy:convex` | Deploy Convex functions |
| `pnpm deploy` | Deploy Convex + build |

---

## Deployment

### Convex Backend

```bash
pnpm deploy:convex
```

### Cloudflare Pages

1. Connect your GitHub repo to Cloudflare Pages
2. Configure build settings:
   - **Build command**: `npx convex deploy && pnpm run build`
   - **Build output**: `dist`
3. Add environment variables in Cloudflare dashboard
4. Deploy on push to main

---

## Features

- **Parallel Judgment**: 4 judges analyze simultaneously
- **Tie-Breaking**: Chief Judge resolves 2-2 splits
- **Rate Limiting**: 2/day free, 3/day signed-in, unlimited Pro
- **Privacy Control**: Public or private verdicts
- **Share Links**: Unique URLs for each verdict
- **Analytics**: Judge leniency leaderboard
- **Security**: Prompt injection protection

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for:

- System diagrams (Mermaid)
- Database schema
- Authentication flow
- Rate limiting logic
- Security measures
- Directory structure

---

## License

MIT
