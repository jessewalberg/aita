"use node";

import { action } from "../../_generated/server";
import { v } from "convex/values";
import { api } from "../../_generated/api";
import { nanoid } from "nanoid";
import { createLLMClient } from "../../lib/llm/client";
import { SINGLE_MODEL } from "../../lib/llm/models";
import {
  buildJudgeSystemPrompt,
  buildJudgeUserPrompt,
} from "../../lib/prompts/judge";
import {
  fallbackJudgeResponse,
  parseJudgeResponse,
  type JudgeResponse,
} from "../../lib/llm/parser";

const client = createLLMClient();

export const generateSingleVerdict = action({
  args: {
    situation: v.string(),
    visitorId: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const start = Date.now();
    const identifier = args.userId ? `user:${args.userId}` : args.visitorId!;

    // Check rate limit
    const usage = await ctx.runQuery(
      api.functions.rateLimit.queries.getUsage,
      { identifier }
    );
    if (usage.singleCount >= 3) {
      throw new Error("RATE_LIMITED");
    }

    // Increment usage
    await ctx.runMutation(api.functions.rateLimit.mutations.increment, {
      identifier,
      type: "single",
    });

    // Call LLM
    let result: JudgeResponse;
    try {
      const response = await client.chat.completions.create({
        model: SINGLE_MODEL.id,
        messages: [
          {
            role: "system",
            content: buildJudgeSystemPrompt(
              SINGLE_MODEL.name,
              SINGLE_MODEL.personality
            ),
          },
          { role: "user", content: buildJudgeUserPrompt(args.situation) },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      result =
        parseJudgeResponse(response.choices[0]?.message?.content ?? "") ??
        fallbackJudgeResponse();
    } catch (e) {
      console.error("LLM error:", e);
      result = fallbackJudgeResponse();
    }

    const shareId = nanoid(10);

    // Save
    await ctx.runMutation(api.functions.verdicts.mutations.create, {
      situation: args.situation,
      mode: "single",
      verdict: result.verdict,
      confidence: result.confidence,
      summary: result.summary,
      reasoning: result.reasoning,
      keyPoints: result.keyPoints,
      shareId,
      isPublic: false,
      isPro: false,
      userId: args.userId,
      visitorId: args.userId ? undefined : args.visitorId,
      latencyMs: Date.now() - start,
    });

    return { shareId, ...result };
  },
});
