import { query } from "../../_generated/server";
import { v } from "convex/values";

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

    return {
      singleCount: usage?.singleCount ?? 0,
      panelCount: usage?.panelCount ?? 0,
    };
  },
});
