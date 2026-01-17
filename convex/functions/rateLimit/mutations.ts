import { mutation } from "../../_generated/server";
import { v } from "convex/values";

function getUtcDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export const increment = mutation({
  args: {
    identifier: v.string(),
    type: v.union(v.literal("single"), v.literal("panel")),
  },
  handler: async (ctx, args) => {
    const date = getUtcDateString();
    const existing = await ctx.db
      .query("dailyUsage")
      .withIndex("by_identifier_date", (q) =>
        q.eq("identifier", args.identifier).eq("date", date)
      )
      .unique();

    if (!existing) {
      const singleCount = args.type === "single" ? 1 : 0;
      const panelCount = args.type === "panel" ? 1 : 0;
      await ctx.db.insert("dailyUsage", {
        identifier: args.identifier,
        date,
        singleCount,
        panelCount,
      });
      return;
    }

    await ctx.db.patch(existing._id, {
      singleCount:
        args.type === "single" ? existing.singleCount + 1 : existing.singleCount,
      panelCount:
        args.type === "panel" ? existing.panelCount + 1 : existing.panelCount,
    });
  },
});
