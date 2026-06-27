import type { Graph } from "../../graph/graph.js";
import type { GraphEdge, GraphNode } from "../../graph/types.js";
import type { Route } from "../../graph/routes.js";
import type { MatchMode } from "../../filters/types.js";

export interface GraphPayload {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface QueryResult {
  query: {
    filters: string[];
    match: MatchMode;
    totalRoutes: number;
    matchedRoutes: number;
  };
  routes: Array<{ nodes: string[]; length: number }>;
  graph: GraphPayload;
}

export function spannedSubgraph(graph: Graph, routes: Route[]): GraphPayload {
  const nodeNames = new Set<string>();
  const edgeKeys = new Set<string>();
  const edges: GraphEdge[] = [];

  for (const route of routes) {
    for (let i = 0; i < route.nodes.length; i++) {
      nodeNames.add(route.nodes[i]);
      if (i > 0) {
        const from = route.nodes[i - 1];
        const to = route.nodes[i];
        const key = `${from}->${to}`;
        if (!edgeKeys.has(key)) {
          edgeKeys.add(key);
          edges.push({ from, to });
        }
      }
    }
  }

  const nodes = [...nodeNames]
    .map((name) => graph.getNode(name))
    .filter((n): n is GraphNode => n !== undefined);

  return { nodes, edges };
}

export function buildQueryResult(
  graph: Graph,
  filterNames: string[],
  mode: MatchMode,
  all: Route[],
  matched: Route[],
): QueryResult {
  return {
    query: {
      filters: filterNames,
      match: mode,
      totalRoutes: all.length,
      matchedRoutes: matched.length,
    },
    routes: matched.map((r) => ({ nodes: r.nodes, length: r.nodes.length })),
    graph: spannedSubgraph(graph, matched),
  };
}
