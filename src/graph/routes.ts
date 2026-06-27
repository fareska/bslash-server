import type { Graph } from "./graph.js";
import { RouteEnumerationDefaults } from "../constants/graph.js";

export interface Route {
  nodes: string[];
}

export interface EnumerateOptions {
  minNodes?: number;
  maxNodes?: number;
  maxRoutes?: number;
}

const DEFAULTS: Required<EnumerateOptions> = {
  minNodes: RouteEnumerationDefaults.MIN_NODES,
  maxNodes: RouteEnumerationDefaults.MAX_NODES,
  maxRoutes: RouteEnumerationDefaults.MAX_ROUTES,
};

/**
 * Enumerates every simple path (not just endpoint pairs) so filters own start/end rules.
 * Path prefixes are included because a shorter prefix may satisfy a filter the full path does not.
 */
export function enumerateRoutes(graph: Graph, options: EnumerateOptions = {}): Route[] {
  const opts = { ...DEFAULTS, ...options };
  const routes: Route[] = [];
  const path: string[] = [];
  const onPath = new Set<string>();

  const dfs = (current: string): void => {
    if (routes.length >= opts.maxRoutes) return;

    path.push(current);
    onPath.add(current);

    if (path.length >= opts.minNodes) {
      routes.push({ nodes: [...path] });
    }

    if (path.length < opts.maxNodes) {
      for (const next of graph.neighbors(current)) {
        if (onPath.has(next)) continue;
        dfs(next);
        if (routes.length >= opts.maxRoutes) break;
      }
    }

    path.pop();
    onPath.delete(current);
  };

  for (const start of graph.nodeNames()) {
    dfs(start);
    if (routes.length >= opts.maxRoutes) break;
  }

  return routes;
}
