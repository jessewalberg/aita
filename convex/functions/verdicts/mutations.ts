import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { LIMITS } from "../../lib/constants/limits";

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

function getUtcDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function verdictToCountKey(verdict: "YTA" | "NTA" | "ESH" | "NAH" | "INFO") {
  switch (verdict) {
    case "YTA":
      return "ytaCount";
    case "NTA":
      return "ntaCount";
    case "ESH":
      return "eshCount";
    case "NAH":
      return "nahCount";
    case "INFO":
      return "infoCount";
  }
}

function calculateLeniency(counts: {
  ytaCount: number;
  ntaCount: number;
  eshCount: number;
  nahCount: number;
  infoCount: number;
}): number {
  const total =
    counts.ytaCount +
    counts.ntaCount +
    counts.eshCount +
    counts.nahCount +
    counts.infoCount;

  if (total === 0) return 50;

  const lenientCount = counts.ntaCount + counts.nahCount;
  const harshCount = counts.ytaCount;
  const leniencyRatio = (lenientCount - harshCount) / total;
  return Math.round(50 + leniencyRatio * 50);
}

export const createPanelVerdictAtomic = mutation({
  args: {
    identifier: v.string(),
    hasUnlimitedAccess: v.optional(v.boolean()),
    situation: v.string(),
    panelVerdicts: v.array(
      v.object({
        modelId: v.string(),
        modelName: v.string(),
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
      })
    ),
    synthesis: v.string(),
    dissent: v.string(),
    panelSplit: v.string(),
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
    const date = getUtcDateString();
    const usage = await ctx.db
      .query("dailyUsage")
      .withIndex("by_identifier_date", (q) =>
        q.eq("identifier", args.identifier).eq("date", date)
      )
      .unique();

    if (!args.hasUnlimitedAccess) {
      const currentCount = usage?.panelCount ?? 0;
      const isSignedIn = args.identifier.startsWith("user:");
      const limit = isSignedIn
        ? LIMITS.SIGNED_IN_PER_DAY
        : LIMITS.ANONYMOUS_PER_DAY;
      if (currentCount >= limit) {
        throw new Error("RATE_LIMITED");
      }
    }

    if (!usage) {
      await ctx.db.insert("dailyUsage", {
        identifier: args.identifier,
        date,
        singleCount: 0,
        panelCount: 1,
      });
    } else {
      await ctx.db.patch(usage._id, {
        panelCount: usage.panelCount + 1,
      });
    }

    const createdAt = Date.now();
    await ctx.db.insert("verdicts", {
      situation: args.situation,
      mode: "panel",
      panelVerdicts: args.panelVerdicts,
      synthesis: args.synthesis,
      dissent: args.dissent,
      panelSplit: args.panelSplit,
      verdict: args.verdict,
      confidence: args.confidence,
      summary: args.summary,
      reasoning: args.reasoning,
      keyPoints: args.keyPoints,
      shareId: args.shareId,
      isPublic: args.isPublic,
      isPro: args.isPro,
      userId: args.userId,
      visitorId: args.visitorId,
      latencyMs: args.latencyMs,
      createdAt,
    });

    for (const panelVerdict of args.panelVerdicts) {
      const existing = await ctx.db
        .query("modelStats")
        .withIndex("by_model", (q) => q.eq("modelId", panelVerdict.modelId))
        .unique();

      const verdictKey = verdictToCountKey(panelVerdict.verdict);

      if (!existing) {
        const counts = {
          ytaCount: 0,
          ntaCount: 0,
          eshCount: 0,
          nahCount: 0,
          infoCount: 0,
        };
        counts[verdictKey] = 1;

        await ctx.db.insert("modelStats", {
          modelId: panelVerdict.modelId,
          modelName: panelVerdict.modelName,
          totalVerdicts: 1,
          ...counts,
          leniencyScore: calculateLeniency(counts),
          updatedAt: Date.now(),
        });
        continue;
      }

      const newCount = existing[verdictKey] + 1;
      const newTotal = existing.totalVerdicts + 1;
      const counts = {
        ytaCount: existing.ytaCount,
        ntaCount: existing.ntaCount,
        eshCount: existing.eshCount,
        nahCount: existing.nahCount,
        infoCount: existing.infoCount,
        [verdictKey]: newCount,
      };

      await ctx.db.patch(existing._id, {
        totalVerdicts: newTotal,
        [verdictKey]: newCount,
        leniencyScore: calculateLeniency(counts),
        updatedAt: Date.now(),
      });
    }
  },
});
