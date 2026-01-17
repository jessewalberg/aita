import { z } from "zod";

export const JudgeResponseSchema = z.object({
  verdict: z.enum(["YTA", "NTA", "ESH", "NAH", "INFO"]),
  confidence: z.number().min(50).max(95),
  summary: z.string(),
  reasoning: z.string(),
  keyPoints: z.array(z.string()),
});

export type JudgeResponse = z.infer<typeof JudgeResponseSchema>;

export function parseJudgeResponse(raw: string): JudgeResponse | null {
  try {
    let content = raw.trim();
    if (content.startsWith("```")) {
      content = content
        .replace(/```json?\n?/g, "")
        .replace(/```$/g, "")
        .trim();
    }
    return JudgeResponseSchema.parse(JSON.parse(content));
  } catch (e) {
    console.error("Parse error:", e);
    return null;
  }
}

export function fallbackJudgeResponse(): JudgeResponse {
  return {
    verdict: "INFO",
    confidence: 50,
    summary: "Unable to analyze at this time.",
    reasoning: "Please try again.",
    keyPoints: ["Try rephrasing your situation"],
  };
}
