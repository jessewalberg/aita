import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    situation: v.string(),
    mode: v.union(v.literal("single"), v.literal("panel")),
    panelVerdicts: v.optional(
      v.array(
        v.object({
          modelId: v.string(),
          modelName: v.string(),
          verdict: v.string(),
          confidence: v.number(),
          summary: v.string(),
          reasoning: v.string(),
          keyPoints: v.array(v.string()),
        })
      )
    ),
    synthesis: v.optional(v.string()),
    dissent: v.optional(v.string()),
    panelSplit: v.optional(v.string()),
    verdict: v.union(
      v.literal("YTA"),
      v.literal("NTA"),
      v.literal("ESH"),
      v.literal("NAH"),
      v.literal("INFO")
    ),
    confidence: v.number(),
    summary: v.string(),
    reasoning: v.string(),
    keyPoints: v.array(v.string()),
    shareId: v.string(),
    isPublic: v.boolean(),
    isPro: v.boolean(),
    userId: v.optional(v.string()),
    visitorId: v.optional(v.string()),
    latencyMs: v.number(),
  },
  handler: async (ctx, args) => {
    const createdAt = Date.now();
    const id = await ctx.db.insert("verdicts", {
      ...args,
      createdAt,
    });
    return id;
  },
});
