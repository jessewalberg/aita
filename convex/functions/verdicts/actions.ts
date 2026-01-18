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
    isPro: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const start = Date.now();

    if (!args.userId && !args.visitorId) {
      throw new Error("MISSING_IDENTIFIER");
    }
    const identifier = args.userId ? `user:${args.userId}` : args.visitorId!;

    // Atomic rate limit check and increment
    const rateCheck = await ctx.runMutation(
      api.functions.rateLimit.mutations.checkAndIncrement,
      { identifier, isPro: args.isPro }
    );
    if (!rateCheck.allowed) {
      throw new Error("RATE_LIMITED");
    }

    // Run all 3 judges in parallel
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
      isPublic: false,
      isPro: args.isPro ?? false,
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
  for (const p of panel) {
    votes[p.verdict] = (votes[p.verdict] || 0) + 1;
  }
  const sorted = Object.entries(votes).sort((a, b) => b[1] - a[1]);
  const topCount = sorted[0]?.[1] ?? 0;
  const isThreeWay = sorted.length === 3 && topCount === 1;

  if (isThreeWay) {
    return {
      verdict: "INFO",
      confidence: 55,
      summary: "Panel split 1-1-1.",
      reasoning: "No consensus; fallback to INFO.",
      keyPoints: ["No majority decision"],
      synthesis: "Fallback synthesis.",
      dissent: "",
      panelSplit: "1-1-1",
    };
  }

  const winner = sorted[0]?.[0] ?? "INFO";
  const panelSplit = `${topCount}-${3 - topCount}`;

  return {
    verdict: winner as ChiefJudgeResponse["verdict"],
    confidence: 60,
    summary: `Panel ruled ${panelSplit}.`,
    reasoning: "Verdict based on majority vote.",
    keyPoints: ["Majority decision"],
    synthesis: "Fallback synthesis.",
    dissent: topCount === 3 ? "" : "Minority judge(s) disagreed.",
    panelSplit,
  };
}
