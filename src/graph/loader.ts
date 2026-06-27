import { readFileSync } from "node:fs";
import { Graph } from "./graph.js";
import type { RawEdge, RawGraph, RawNode } from "./types.js";
import { LoaderMessages } from "../constants/messages.js";
import { SyntheticNode } from "../constants/graph.js";

function toTargets(to: RawEdge["to"]): string[] {
  return Array.isArray(to) ? to : [to];
}

/**
 * Undeclared nodes (e.g. assurance-service in the source data) are kept as synthetic
 * placeholders so edges stay traversable rather than being dropped.
 */
export function buildGraph(raw: RawGraph): Graph {
  const graph = new Graph();

  for (const node of raw.nodes ?? []) {
    if (!node?.name) continue;
    graph.addNode({ ...node });
  }

  for (const edge of raw.edges ?? []) {
    if (!edge?.from) continue;
    const from = edge.from;
    ensureNode(graph, from);

    for (const to of toTargets(edge.to)) {
      if (!to) continue;
      ensureNode(graph, to);
      graph.addEdge(from, to);
    }
  }

  return graph;
}

function ensureNode(graph: Graph, name: string): void {
  if (graph.hasNode(name)) return;
  graph.addNode({
    name,
    kind: SyntheticNode.KIND,
    synthetic: true,
  } as RawNode & { synthetic: true });
  graph.warnings.push(LoaderMessages.syntheticNodeWarning(name));
}

export function loadGraphFromFile(path: string): Graph {
  const raw = JSON.parse(readFileSync(path, "utf-8")) as RawGraph;
  return buildGraph(raw);
}
