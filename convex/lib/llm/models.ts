// OpenRouter model IDs - verified available models
// See: https://openrouter.ai/models
export const JUDGES = [
  {
    id: "anthropic/claude-3.5-haiku",
    name: "Claude",
    personality: "Empathetic",
    tagline: "Considers emotional context",
    color: "#D97706",
    bgClass: "bg-amber-100",
    textClass: "text-amber-700",
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT",
    personality: "Logical",
    tagline: "Focuses on facts and fairness",
    color: "#059669",
    bgClass: "bg-emerald-100",
    textClass: "text-emerald-700",
  },
  {
    id: "google/gemini-2.0-flash-001",
    name: "Gemini",
    personality: "Practical",
    tagline: "Seeks real-world solutions",
    color: "#2563EB",
    bgClass: "bg-blue-100",
    textClass: "text-blue-700",
  },
  {
    id: "x-ai/grok-3-mini",
    name: "Grok",
    personality: "Skeptical",
    tagline: "Questions motives and spots inconsistencies",
    color: "#E11D48",
    bgClass: "bg-rose-100",
    textClass: "text-rose-700",
  },
] as const;

export const CHIEF_JUDGE = {
  id: "anthropic/claude-3.5-sonnet",
  name: "Chief Judge",
};

export const SINGLE_MODEL = JUDGES[0];

export type Judge = (typeof JUDGES)[number];
export type JudgeName = (typeof JUDGES)[number]["name"];
