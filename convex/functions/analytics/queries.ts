import { query } from "../../_generated/server";

export const getModelStats = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("modelStats")
      .withIndex("by_leniency")
      .order("desc")
      .collect();
  },
});
