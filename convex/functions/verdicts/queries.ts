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

export const getRecentPublic = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("verdicts")
      .withIndex("by_public_createdAt", (q) => q.eq("isPublic", true))
      .order("desc")
      .take(limit);
  },
});
