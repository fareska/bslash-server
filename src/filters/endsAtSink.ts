import type { Graph } from "../graph/graph.js";
import type { Route } from "../graph/routes.js";
import type { RouteFilter } from "./types.js";
import { SINK_KINDS, SinkKinds } from "../constants/graph.js";

export const endsAtSink: RouteFilter = {
  name: "endsAtSink",
  description: `Routes that end in a sink (kind: ${SinkKinds.RDS}/${SinkKinds.SQL}).`,
  matches(route: Route, graph: Graph): boolean {
    const end = route.nodes[route.nodes.length - 1];
    const kind = graph.getNode(end)?.kind;
    return kind !== undefined && SINK_KINDS.has(kind);
  },
};
