import { describe, it, expect } from "vitest";
import { JUDGES, CHIEF_JUDGE, SINGLE_MODEL } from "./models";

// Known supported OpenRouter model patterns
// These are the stable model IDs that should work on OpenRouter
// See: https://openrouter.ai/models
const SUPPORTED_MODEL_PATTERNS = [
  // Anthropic Claude models
  /^anthropic\/claude-3\.5-haiku$/,
  /^anthropic\/claude-3\.5-sonnet$/,
  /^anthropic\/claude-3-haiku$/,
  /^anthropic\/claude-3-sonnet$/,
  /^anthropic\/claude-3-opus$/,
  /^anthropic\/claude-haiku-4\.5$/,
  /^anthropic\/claude-sonnet-4$/,
  // OpenAI models
  /^openai\/gpt-4o-mini$/,
  /^openai\/gpt-4o$/,
  /^openai\/gpt-4-turbo$/,
  /^openai\/gpt-3\.5-turbo$/,
  // Google Gemini models
  /^google\/gemini-2\.0-flash-001$/,
  /^google\/gemini-2\.5-flash$/,
  /^google\/gemini-2\.5-pro$/,
  /^google\/gemini-1\.5-flash$/,
  /^google\/gemini-1\.5-pro$/,
];

// Model IDs that are known to NOT work (experimental, dated versions, etc.)
const UNSUPPORTED_MODEL_PATTERNS = [
  // Dated versions often get removed
  /-\d{8}$/, // e.g., claude-3-5-haiku-20241022
  // Experimental versions
  /-exp$/, // e.g., gemini-2.0-flash-exp
  /-preview/, // Preview versions may be unstable
];

function isModelSupported(modelId: string): boolean {
  // Check if it matches any unsupported pattern
  for (const pattern of UNSUPPORTED_MODEL_PATTERNS) {
    if (pattern.test(modelId)) {
      return false;
    }
  }

  // Check if it matches any supported pattern
  for (const pattern of SUPPORTED_MODEL_PATTERNS) {
    if (pattern.test(modelId)) {
      return true;
    }
  }

  return false;
}

describe("LLM Models Configuration", () => {
  describe("JUDGES", () => {
    it("should have exactly 3 judges", () => {
      expect(JUDGES).toHaveLength(3);
    });

    it("should have unique judge names", () => {
      const names = JUDGES.map((j) => j.name);
      expect(new Set(names).size).toBe(names.length);
    });

    it("should have unique model IDs", () => {
      const ids = JUDGES.map((j) => j.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it.each(JUDGES)("$name should use a supported OpenRouter model ID", (judge) => {
      expect(isModelSupported(judge.id)).toBe(true);
    });

    it.each(JUDGES)("$name should not use dated version model IDs", (judge) => {
      expect(judge.id).not.toMatch(/-\d{8}$/);
    });

    it.each(JUDGES)("$name should not use experimental model IDs", (judge) => {
      expect(judge.id).not.toMatch(/-exp$/);
    });

    it.each(JUDGES)("$name should have required properties", (judge) => {
      expect(judge).toHaveProperty("id");
      expect(judge).toHaveProperty("name");
      expect(judge).toHaveProperty("personality");
      expect(judge).toHaveProperty("tagline");
      expect(judge).toHaveProperty("color");
      expect(judge).toHaveProperty("bgClass");
      expect(judge).toHaveProperty("textClass");
    });

    it("should have expected judge names", () => {
      const names = JUDGES.map((j) => j.name);
      expect(names).toContain("Claude");
      expect(names).toContain("GPT");
      expect(names).toContain("Gemini");
    });
  });

  describe("CHIEF_JUDGE", () => {
    it("should use a supported OpenRouter model ID", () => {
      expect(isModelSupported(CHIEF_JUDGE.id)).toBe(true);
    });

    it("should not use dated version model IDs", () => {
      expect(CHIEF_JUDGE.id).not.toMatch(/-\d{8}$/);
    });

    it("should not use experimental model IDs", () => {
      expect(CHIEF_JUDGE.id).not.toMatch(/-exp$/);
    });

    it("should have required properties", () => {
      expect(CHIEF_JUDGE).toHaveProperty("id");
      expect(CHIEF_JUDGE).toHaveProperty("name");
    });

    it("should be named Chief Judge", () => {
      expect(CHIEF_JUDGE.name).toBe("Chief Judge");
    });
  });

  describe("SINGLE_MODEL", () => {
    it("should reference the first judge", () => {
      expect(SINGLE_MODEL).toBe(JUDGES[0]);
    });
  });

  describe("Model ID Format", () => {
    const allModels = [...JUDGES.map((j) => j.id), CHIEF_JUDGE.id];

    it.each(allModels)('"%s" should follow provider/model format', (modelId) => {
      expect(modelId).toMatch(/^[a-z]+\/[a-z0-9.-]+$/);
    });
  });
});
