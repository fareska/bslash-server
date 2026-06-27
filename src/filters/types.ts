import type { Graph } from "../graph/graph.js";
import type { Route } from "../graph/routes.js";

export interface RouteFilter {
  readonly name: string;
  readonly description: string;
  matches(route: Route, graph: Graph): boolean;
}

export type MatchMode = "all" | "any";

export const MatchModes = {
  ALL: "all",
  ANY: "any",
} as const satisfies Record<string, MatchMode>;

export const DEFAULT_MATCH_MODE: MatchMode = MatchModes.ALL;
