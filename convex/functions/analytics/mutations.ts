import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const recordVerdict = mutation({
  args: {
    modelId: v.string(),
    modelName: v.string(),
    verdict: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("modelStats")
      .withIndex("by_model", (q) => q.eq("modelId", args.modelId))
      .unique();

    const verdictKey = `${args.verdict.toLowerCase()}Count` as
      | "ytaCount"
      | "ntaCount"
      | "eshCount"
      | "nahCount"
      | "infoCount";

    if (!existing) {
      const counts = {
        ytaCount: 0,
        ntaCount: 0,
        eshCount: 0,
        nahCount: 0,
        infoCount: 0,
      };
      counts[verdictKey] = 1;

      // Leniency: higher = more lenient (NTA/NAH)
      // Lower = harsher (YTA)
      const leniencyScore = calculateLeniency(counts);

      await ctx.db.insert("modelStats", {
        modelId: args.modelId,
        modelName: args.modelName,
        totalVerdicts: 1,
        ...counts,
        leniencyScore,
        updatedAt: Date.now(),
      });
      return;
    }

    const newCount = (existing[verdictKey] ?? 0) + 1;
    const newTotal = existing.totalVerdicts + 1;

    const counts = {
      ytaCount: existing.ytaCount,
      ntaCount: existing.ntaCount,
      eshCount: existing.eshCount,
      nahCount: existing.nahCount,
      infoCount: existing.infoCount,
      [verdictKey]: newCount,
    };

    const leniencyScore = calculateLeniency(counts);

    await ctx.db.patch(existing._id, {
      totalVerdicts: newTotal,
      [verdictKey]: newCount,
      leniencyScore,
      updatedAt: Date.now(),
    });
  },
});

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

  // NTA and NAH are lenient (+), YTA is harsh (-), ESH is neutral, INFO is neutral
  const lenientCount = counts.ntaCount + counts.nahCount;
  const harshCount = counts.ytaCount;

  // Score from 0-100 where 50 is neutral
  // More NTA/NAH = higher score, more YTA = lower score
  const leniencyRatio = (lenientCount - harshCount) / total;
  return Math.round(50 + leniencyRatio * 50);
}
