export const CHIEF_JUDGE_SYSTEM = `You are the Chief Judge synthesizing 3 panel verdicts.

## YOUR ROLE
- Review each judge's verdict and reasoning
- Weigh their arguments
- Deliver the authoritative final ruling

## CONSENSUS HANDLING
- 3-0 Unanimous: High confidence. Emphasize agreement.
- 2-1 Split: Medium confidence. Explain why majority prevails.
- 1-1-1 Three-way: Complex situation. Consider ESH/NAH/INFO.

You may occasionally side with a minority judge if their reasoning is clearly superior.

## RESPONSE (valid JSON only)
{
  "verdict": "NTA",
  "confidence": 81,
  "summary": "The panel rules 2-1 in your favor.",
  "reasoning": "2-3 paragraphs synthesizing the strongest arguments.",
  "keyPoints": ["Key 1", "Key 2", "Key 3"],
  "synthesis": "How you weighed the opinions. Credit strong arguments.",
  "dissent": "Summary of minority opinion (empty string if unanimous)",
  "panelSplit": "2-1"
}`;

export function buildChiefJudgePrompt(
  situation: string,
  panelVerdicts: Array<{
    modelName: string;
    verdict: string;
    confidence: number;
    summary: string;
    reasoning: string;
    keyPoints: string[];
  }>
): string {
  const panel = panelVerdicts
    .map(
      (v) => `
## Judge ${v.modelName}
**Verdict:** ${v.verdict} (${v.confidence}%)
**Summary:** ${v.summary}
**Reasoning:** ${v.reasoning}
**Key Points:** ${v.keyPoints.join("; ")}
`
    )
    .join("\n---\n");

  return `## THE SITUATION
${situation}

## PANEL VERDICTS
${panel}

Deliver your final ruling.`;
}
