import { query } from "../../_generated/server";
import { v } from "convex/values";
import { LIMITS } from "../../lib/constants/limits";

function getUtcDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export const getUsage = query({
  args: { identifier: v.string() },
  handler: async (ctx, args) => {
    const date = getUtcDateString();
    const usage = await ctx.db
      .query("dailyUsage")
      .withIndex("by_identifier_date", (q) =>
        q.eq("identifier", args.identifier).eq("date", date)
      )
      .unique();

    const isSignedIn = args.identifier.startsWith("user:");
    const limit = isSignedIn ? LIMITS.SIGNED_IN_PER_DAY : LIMITS.ANONYMOUS_PER_DAY;
    const used = usage?.panelCount ?? 0;

    return {
      used,
      limit,
      remaining: Math.max(0, limit - used),
      isSignedIn,
    };
  },
});
