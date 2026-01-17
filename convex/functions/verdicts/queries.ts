import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getByShareId = query({
  args: { shareId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("verdicts")
      .withIndex("by_shareId", (q) => q.eq("shareId", args.shareId))
      .unique();
  },
});
