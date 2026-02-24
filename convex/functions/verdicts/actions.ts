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
        if (!parsed) {
          console.error(`Judge ${judge.name} returned invalid JSON response`);
          throw new Error("OPENROUTER_INVALID_RESPONSE");
        }

        return {
          modelId: judge.id,
          modelName: judge.name,
          ...parsed,
        };
      } catch (e) {
        console.error(`Judge ${judge.name} failed:`, e);
        if (e instanceof Error && e.message === "OPENROUTER_INVALID_RESPONSE") {
          throw e;
        }
        throw new Error("OPENROUTER_UNAVAILABLE");
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

      const parsedChief = parseChiefJudgeResponse(
        chiefResponse.choices[0]?.message?.content ?? ""
      );
      if (!parsedChief) {
        console.error("Chief Judge returned invalid JSON response");
        throw new Error("OPENROUTER_INVALID_RESPONSE");
      }
      chiefResult = parsedChief;
    } catch (e) {
      console.error("Chief Judge failed:", e);
      if (e instanceof Error && e.message === "OPENROUTER_INVALID_RESPONSE") {
        throw e;
      }
      throw new Error("OPENROUTER_UNAVAILABLE");
    }

    const shareId = nanoid(10);

    await ctx.runMutation(api.functions.verdicts.mutations.createPanelVerdictAtomic, {
      identifier,
      hasUnlimitedAccess,
      situation: args.situation,
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

    return {
      shareId,
      panelVerdicts: panelResults,
      ...chiefResult,
    };
  },
});
