/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as functions_analytics_index from "../functions/analytics/index.js";
import type * as functions_analytics_mutations from "../functions/analytics/mutations.js";
import type * as functions_analytics_queries from "../functions/analytics/queries.js";
import type * as functions_index from "../functions/index.js";
import type * as functions_rateLimit_index from "../functions/rateLimit/index.js";
import type * as functions_rateLimit_mutations from "../functions/rateLimit/mutations.js";
import type * as functions_rateLimit_queries from "../functions/rateLimit/queries.js";
import type * as functions_users_index from "../functions/users/index.js";
import type * as functions_users_queries from "../functions/users/queries.js";
import type * as functions_verdicts_actions from "../functions/verdicts/actions.js";
import type * as functions_verdicts_index from "../functions/verdicts/index.js";
import type * as functions_verdicts_mutations from "../functions/verdicts/mutations.js";
import type * as functions_verdicts_queries from "../functions/verdicts/queries.js";
import type * as lib_constants_limits from "../lib/constants/limits.js";
import type * as lib_constants_verdicts from "../lib/constants/verdicts.js";
import type * as lib_llm_client from "../lib/llm/client.js";
import type * as lib_llm_models from "../lib/llm/models.js";
import type * as lib_llm_parser from "../lib/llm/parser.js";
import type * as lib_prompts_chiefJudge from "../lib/prompts/chiefJudge.js";
import type * as lib_prompts_judge from "../lib/prompts/judge.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "functions/analytics/index": typeof functions_analytics_index;
  "functions/analytics/mutations": typeof functions_analytics_mutations;
  "functions/analytics/queries": typeof functions_analytics_queries;
  "functions/index": typeof functions_index;
  "functions/rateLimit/index": typeof functions_rateLimit_index;
  "functions/rateLimit/mutations": typeof functions_rateLimit_mutations;
  "functions/rateLimit/queries": typeof functions_rateLimit_queries;
  "functions/users/index": typeof functions_users_index;
  "functions/users/queries": typeof functions_users_queries;
  "functions/verdicts/actions": typeof functions_verdicts_actions;
  "functions/verdicts/index": typeof functions_verdicts_index;
  "functions/verdicts/mutations": typeof functions_verdicts_mutations;
  "functions/verdicts/queries": typeof functions_verdicts_queries;
  "lib/constants/limits": typeof lib_constants_limits;
  "lib/constants/verdicts": typeof lib_constants_verdicts;
  "lib/llm/client": typeof lib_llm_client;
  "lib/llm/models": typeof lib_llm_models;
  "lib/llm/parser": typeof lib_llm_parser;
  "lib/prompts/chiefJudge": typeof lib_prompts_chiefJudge;
  "lib/prompts/judge": typeof lib_prompts_judge;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
