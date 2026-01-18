"use node";

import { action } from "../../_generated/server";
import { v } from "convex/values";
import { api } from "../../_generated/api";
import { nanoid } from "nanoid";
import { createLLMClient } from "../../lib/llm/client";
import { CHIEF_JUDGE, JUDGES } from "../../lib/llm/models";
import {
  buildJudgeSystemPrompt,
  buildJudgeUserPrompt,
} from "../../lib/prompts/judge";
import {
  CHIEF_JUDGE_SYSTEM,
  buildChiefJudgePrompt,
} from "../../lib/prompts/chiefJudge";
import {
  fallbackJudgeResponse,
  parseChiefJudgeResponse,
  parseJudgeResponse,
  type ChiefJudgeResponse,
  type JudgeResponse,
} from "../../lib/llm/parser";
import { hasUnlimitedVerdicts } from "../../lib/permissions";

// Lazy client creation to avoid module-load-time errors
let _client: ReturnType<typeof createLLMClient> | null = null;
function getClient() {
  if (!_client) {
    _client = createLLMClient();
  }
  return _client;
}

type PanelJudgeResult = JudgeResponse & {
  modelId: string;
  modelName: string;
  success: boolean;
};

export const generatePanelVerdict = action({
  args: {
    situation: v.string(),
    visitorId: v.optional(v.string()),
    userId: v.optional(v.string()),
    // User billing tier
    userTier: v.optional(v.union(v.literal("free"), v.literal("pro"))),
    // User permission role
    userRole: v.optional(
      v.union(v.literal("user"), v.literal("pro"), v.literal("admin"))
    ),
    // Whether to keep this verdict private (default: false = public)
    isPrivate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const start = Date.now();

    if (!args.userId && !args.visitorId) {
      throw new Error("MISSING_IDENTIFIER");
    }
    const identifier = args.userId ? `user:${args.userId}` : args.visitorId!;

    // Build user record for permission check
    const userRecord = args.userTier
      ? { tier: args.userTier, role: args.userRole }
      : null;
    const hasUnlimitedAccess = hasUnlimitedVerdicts(userRecord);

    // Atomic rate limit check and increment
    const rateCheck = await ctx.runMutation(
      api.functions.rateLimit.mutations.checkAndIncrement,
      { identifier, hasUnlimitedAccess }
    );
    if (!rateCheck.allowed) {
      throw new Error("RATE_LIMITED");
    }

    // Run all 4 judges in parallel
    const judgePromises = JUDGES.map(async (judge) => {
      try {
        const response = await getClient().chat.completions.create({
          model: judge.id,
          messages: [
            {
              role: "system",
              content: buildJudgeSystemPrompt(judge.name, judge.personality),
            },
            { role: "user", content: buildJudgeUserPrompt(args.situation) },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        });

        const parsed = parseJudgeResponse(
          response.choices[0]?.message?.content ?? ""
        );

        return {
          modelId: judge.id,
          modelName: judge.name,
          ...(parsed ?? fallbackJudgeResponse()),
          success: !!parsed,
        };
      } catch (e) {
        console.error(`Judge ${judge.name} failed:`, e);
        return {
          modelId: judge.id,
          modelName: judge.name,
          ...fallbackJudgeResponse(),
          success: false,
        };
      }
    });

    const panelResults = (await Promise.all(judgePromises)) as PanelJudgeResult[];

    // Chief Judge synthesizes
    let chiefResult: ChiefJudgeResponse;
    try {
      const chiefResponse = await getClient().chat.completions.create({
        model: CHIEF_JUDGE.id,
        messages: [
          { role: "system", content: CHIEF_JUDGE_SYSTEM },
          { role: "user", content: buildChiefJudgePrompt(args.situation, panelResults) },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      chiefResult =
        parseChiefJudgeResponse(chiefResponse.choices[0]?.message?.content ?? "") ??
        createFallbackChiefResult(panelResults);
    } catch (e) {
      console.error("Chief Judge failed:", e);
      chiefResult = createFallbackChiefResult(panelResults);
    }

    const shareId = nanoid(10);

    // Save everything
    await ctx.runMutation(api.functions.verdicts.mutations.create, {
      situation: args.situation,
      mode: "panel",
      panelVerdicts: panelResults.map((p) => ({
        modelId: p.modelId,
        modelName: p.modelName,
        verdict: p.verdict,
        confidence: p.confidence,
        summary: p.summary,
        reasoning: p.reasoning,
        keyPoints: p.keyPoints,
      })),
      synthesis: chiefResult.synthesis,
      dissent: chiefResult.dissent,
      panelSplit: chiefResult.panelSplit,
      verdict: chiefResult.verdict,
      confidence: chiefResult.confidence,
      summary: chiefResult.summary,
      reasoning: chiefResult.reasoning,
      keyPoints: chiefResult.keyPoints,
      shareId,
      isPublic: !args.isPrivate,
      isPro: hasUnlimitedAccess,
      userId: args.userId,
      visitorId: args.userId ? undefined : args.visitorId,
      latencyMs: Date.now() - start,
    });

    // Update model stats for each judge
    for (const p of panelResults) {
      await ctx.runMutation(api.functions.analytics.mutations.recordVerdict, {
        modelId: p.modelId,
        modelName: p.modelName,
        verdict: p.verdict,
      });
    }

    return {
      shareId,
      panelVerdicts: panelResults,
      ...chiefResult,
    };
  },
});

function createFallbackChiefResult(
  panel: PanelJudgeResult[]
): ChiefJudgeResponse {
  const votes: Record<string, number> = {};
  const confidenceByVerdict: Record<string, number[]> = {};

  for (const p of panel) {
    votes[p.verdict] = (votes[p.verdict] || 0) + 1;
    if (!confidenceByVerdict[p.verdict]) {
      confidenceByVerdict[p.verdict] = [];
    }
    confidenceByVerdict[p.verdict].push(p.confidence);
  }

  const sorted = Object.entries(votes).sort((a, b) => b[1] - a[1]);
  const topCount = sorted[0]?.[1] ?? 0;
  const secondCount = sorted[1]?.[1] ?? 0;
  const numJudges = panel.length; // 4 judges

  // Check for 2-2 tie
  if (topCount === 2 && secondCount === 2) {
    // Tie-breaker: use average confidence
    const firstVerdict = sorted[0][0];
    const secondVerdict = sorted[1][0];
    const avgFirst =
      confidenceByVerdict[firstVerdict].reduce((a, b) => a + b, 0) /
      confidenceByVerdict[firstVerdict].length;
    const avgSecond =
      confidenceByVerdict[secondVerdict].reduce((a, b) => a + b, 0) /
      confidenceByVerdict[secondVerdict].length;

    const winner = avgFirst >= avgSecond ? firstVerdict : secondVerdict;

    return {
      verdict: winner as ChiefJudgeResponse["verdict"],
      confidence: 55,
      summary: "Panel tied 2-2. Chief broke the tie based on confidence.",
      reasoning: "With a 2-2 split, the tie was broken by weighing confidence levels.",
      keyPoints: ["Tie-breaker by confidence"],
      synthesis: "Fallback tie-breaking synthesis.",
      dissent: "Two judges disagreed with the final ruling.",
      panelSplit: "2-2 (tie broken)",
    };
  }

  // Check for no consensus (4-way or 3-way split)
  const isNoConsensus = topCount === 1;
  if (isNoConsensus) {
    return {
      verdict: "INFO",
      confidence: 50,
      summary: "Panel split with no majority.",
      reasoning: "No consensus; fallback to INFO.",
      keyPoints: ["No majority decision"],
      synthesis: "Fallback synthesis.",
      dissent: "",
      panelSplit: "split",
    };
  }

  // Clear majority (4-0, 3-1, or 2-1-1)
  const winner = sorted[0]?.[0] ?? "INFO";
  const minorityCount = numJudges - topCount;
  const panelSplit = `${topCount}-${minorityCount}`;
  const isUnanimous = topCount === numJudges;

  return {
    verdict: winner as ChiefJudgeResponse["verdict"],
    confidence: isUnanimous ? 70 : topCount === 3 ? 65 : 60,
    summary: isUnanimous
      ? "Panel ruled unanimously."
      : `Panel ruled ${panelSplit}.`,
    reasoning: "Verdict based on majority vote.",
    keyPoints: [isUnanimous ? "Unanimous decision" : "Majority decision"],
    synthesis: "Fallback synthesis.",
    dissent: isUnanimous ? "" : "Minority judge(s) disagreed.",
    panelSplit,
  };
}
