# CLAUDE.md — AITA Verdict: Panel Mode

> Auto-read by Claude Code for project context.

## Project Overview

**AITA Verdict: Panel Mode** — 3 AI judges debate your situation, then a Chief Judge delivers the final ruling.

*"I asked 3 AIs if I was the asshole. They disagreed."*

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | TanStack Start |
| Backend | Convex |
| Auth | WorkOS AuthKit |
| UI | shadcn/ui |
| LLM | OpenRouter |
| Validation | Zod |
| Package Manager | PNPM |

## The Judges

| Name | Model | Personality | Color |
|------|-------|-------------|-------|
| Claude | `claude-3-5-haiku` | Empathetic | Amber 🟠 |
| GPT | `gpt-4o-mini` | Logical | Emerald 🟢 |
| Gemini | `gemini-2.0-flash` | Practical | Blue 🔵 |
| **Chief** | `claude-3-5-sonnet` | Synthesizer | Violet 🟣 |

## Verdict Codes

| Code | Label | Color |
|------|-------|-------|
| YTA | You're The A-hole | Red |
| NTA | Not The A-hole | Emerald |
| ESH | Everyone Sucks Here | Amber |
| NAH | No A-holes Here | Blue |
| INFO | Need More Info | Zinc |

## Modes

| Mode | Description | Who |
|------|-------------|-----|
| Single | 1 judge, quick verdict | Free (3/day) |
| Panel | 3 judges + synthesis | Pro only |

## Architecture

### Key Folders
```
convex/
  functions/
    verdicts/actions.ts    # generateSingle, generatePanel
  lib/
    prompts/judge.ts       # Individual judge prompt
    prompts/chiefJudge.ts  # Synthesis prompt
    llm/models.ts          # Judge definitions

src/features/
  verdict/components/
    PanelDisplay.tsx       # Full panel UI
    JudgeCard.tsx          # Individual judge
    DissentSection.tsx     # Minority opinion
    VerdictForm.tsx        # Mode selector + submission form
    SingleVerdictCard.tsx  # Single-mode verdict UI
```

### Panel Flow
```
User submits
    │
    ├──► Claude ──┐
    ├──► GPT ─────┼──► Chief Judge ──► Final Verdict
    └──► Gemini ──┘
    
    (3 parallel)     (synthesis)
```

## Convex Patterns

```typescript
// Parallel judge calls
const results = await Promise.all(
  JUDGES.map(judge => callLLM(judge, situation))
);

// Then Chief Judge
const final = await callChiefJudge(results);
```

## Commands

```bash
npm run dev           # Start dev
npx convex dev        # Convex dev
npx convex deploy     # Deploy backend
```

## Environment

```
CONVEX_DEPLOYMENT=
VITE_CONVEX_URL=
WORKOS_CLIENT_ID=
WORKOS_API_KEY=
VITE_WORKOS_CLIENT_ID=
VITE_WORKOS_REDIRECT_URI=
OPENROUTER_API_KEY=
```

## Current Phase

Phase: NOT STARTED
Completed: None
Next: Phase 1 - Project Setup

## Key Decisions

- Judges run in PARALLEL (Promise.all)
- Each judge has distinct personality prompt
- Chief Judge sees all 3 verdicts before ruling
- Dissent is highlighted if 2-1 split
- Fallback: majority vote if Chief fails

## Design Rules

- NOT generic AI slop
- Each judge has visual identity (icon + color)
- Panel feels like a courtroom
- Dissent clearly distinguished
- Bold typography, minimal decoration
