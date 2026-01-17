export const VERDICT_CONFIG = {
  YTA: { label: "You're The A-hole", color: "red", emoji: "😬" },
  NTA: { label: "Not The A-hole", color: "emerald", emoji: "✅" },
  ESH: { label: "Everyone Sucks Here", color: "amber", emoji: "🤦" },
  NAH: { label: "No A-holes Here", color: "blue", emoji: "🤝" },
  INFO: { label: "Need More Info", color: "zinc", emoji: "❓" },
} as const;

export type VerdictCode = keyof typeof VERDICT_CONFIG;
